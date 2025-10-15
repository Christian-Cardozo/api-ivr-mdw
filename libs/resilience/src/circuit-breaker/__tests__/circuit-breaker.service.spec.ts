import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { CircuitOpenError, NonRetryableError } from '@app/common/errors';
import { CircuitBreakerState, CircuitState } from '../circuit-breaker.interface';
import { CircuitBreakerService } from '../circuit-breaker.service';
import { CircuitBreakerStore } from '../circuit-breaker.store';

// ---------------------------------------------------------------------
// MOCK DE DEPENDENCIAS
// ---------------------------------------------------------------------

// Estado interno simulado para el CircuitBreakerStore
let mockInternalBreakerState: CircuitBreakerState = {
  state: 'CLOSED',
  failures: 0,
  successes: 0,
  lastStateChange: Date.now(),
  halfOpenProbeInFlight: false,
  lastFailureTime: 0,
};

// Mock del CircuitBreakerStore
const mockCircuitBreakerStore = {
  getBreakerState: jest.fn(async () => ({ ...mockInternalBreakerState })),
  acquireHalfOpenProbeLock: jest.fn(),
  setToHalfOpen: jest.fn(() => { mockInternalBreakerState.state = 'HALF_OPEN'; mockInternalBreakerState.successes = 0; }),
  incrementSuccesses: jest.fn(async () => {
    mockInternalBreakerState.successes++;
    return mockInternalBreakerState.successes;
  }),
  setToClosed: jest.fn(() => { mockInternalBreakerState.state = 'CLOSED'; mockInternalBreakerState.failures = 0; mockInternalBreakerState.successes = 0; }),
  resetFailures: jest.fn(() => { mockInternalBreakerState.failures = 0; }),
  incrementFailures: jest.fn(async () => {
    mockInternalBreakerState.failures++;
    return mockInternalBreakerState.failures;
  }),
  updateLastChange: jest.fn(),
  setToOpen: jest.fn((key: string, releaseProbeLock: boolean) => {
    mockInternalBreakerState.state = 'OPEN';
    mockInternalBreakerState.lastStateChange = Date.now();
    if (releaseProbeLock) mockInternalBreakerState.halfOpenProbeInFlight = false;
  }),
  getState: jest.fn(async () => mockInternalBreakerState.state),
  // FIX: Se corrigió el typo de la variable a 'mockInternalBreakerState'
  manualReset: jest.fn(() => { mockInternalBreakerState.state = 'CLOSED'; }), 
};

const KEY = 'test-service';

// ---------------------------------------------------------------------
// TESTS
// ---------------------------------------------------------------------

describe('CircuitBreakerService (Distributed Logic)', () => {
  let service: CircuitBreakerService;

  // Silenciar logs durante las pruebas para no saturar la consola
  const originalLogger = Logger.prototype.warn;
  beforeAll(() => {
    Logger.prototype.warn = jest.fn();
    Logger.prototype.log = jest.fn();
    Logger.prototype.error = jest.fn();
  });
  afterAll(() => {
    Logger.prototype.warn = originalLogger;
    Logger.prototype.log = originalLogger;
    Logger.prototype.error = originalLogger;
  });


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircuitBreakerService,
        {
          provide: CircuitBreakerStore,
          useValue: mockCircuitBreakerStore,
        },
      ],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
    // Resetear el estado mock antes de cada test
    mockInternalBreakerState = {
      state: 'CLOSED' as CircuitState,
      failures: 0,
      successes: 0,
      lastStateChange: Date.now(),
      halfOpenProbeInFlight: false,
      lastFailureTime: 0,
    };
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- ESCENARIO 1: CLOSED a OPEN por Fallos Consecutivos (Threshold: 3) ---
  it('debe pasar de CLOSED a OPEN después de 3 fallos consecutivos', async () => {
    const failFn = () => Promise.reject(new Error('500 Internal Error'));

    // Simular fallos incrementando el contador en el mock
    mockCircuitBreakerStore.incrementFailures.mockImplementation(async () => {
      mockInternalBreakerState.failures++;
      return mockInternalBreakerState.failures;
    });

    // 1er fallo (CLOSED, failures=1)
    await expect(service.execute(KEY, failFn)).rejects.toThrow();
    expect(mockCircuitBreakerStore.incrementFailures).toHaveBeenCalledTimes(1);
    expect(mockInternalBreakerState.state).toBe('CLOSED');

    // 2do fallo (CLOSED, failures=2)
    await expect(service.execute(KEY, failFn)).rejects.toThrow();
    expect(mockCircuitBreakerStore.incrementFailures).toHaveBeenCalledTimes(2);
    expect(mockInternalBreakerState.state).toBe('CLOSED');

    // 3er fallo (CLOSED -> OPEN, failures=3)
    await expect(service.execute(KEY, failFn)).rejects.toThrow();
    expect(mockCircuitBreakerStore.incrementFailures).toHaveBeenCalledTimes(3);
    expect(mockCircuitBreakerStore.setToOpen).toHaveBeenCalledTimes(1);
    expect(mockInternalBreakerState.state).toBe('OPEN');
  });

  // --- ESCENARIO 2: Reenvío y Sanación en HALF_OPEN con 4xx ---
  it('debe contar un NonRetryableError (4xx) como éxito de sanación en HALF_OPEN', async () => {
    // 1. Forzar el estado a OPEN y simular que el timeout ya pasó
    mockInternalBreakerState.state = 'OPEN';
    mockInternalBreakerState.lastStateChange = Date.now() - 30000; // 30s en el pasado (resetTimeoutMs=15000)

    // 2. Simular que adquirimos la sonda
    mockCircuitBreakerStore.acquireHalfOpenProbeLock.mockResolvedValue(true);
    
    const SPECIFIC_MESSAGE = '404 Not Found Business Error';    
    const fail4xxFn = () => Promise.reject(new NonRetryableError(new Error(SPECIFIC_MESSAGE)));

    let errorCaught: Error | null = null;
    let resolved = false;

    // 3. Ejecutar la sonda (Debe pasar a HALF_OPEN y luego fallar con 4xx)
    // ⚠️ CAMBIO CRÍTICO: Usamos try/catch manual para forzar la captura de la excepción y verificar si resolvió.
    try {
      await service.execute(KEY, fail4xxFn);
      // Si el código llega aquí, significa que la promesa del servicio RESOLVIÓ.
      resolved = true;
    } catch (error) {
      errorCaught = error as Error;
    }

    // Aserción 1: Garantizar que la promesa no se resolvió
    // Si 'resolved' es true, el test falla.
    expect(resolved).toBe(false);

    // Aserción 2: Verificación de la excepción capturada
    expect(errorCaught).not.toBeNull();
    expect(errorCaught).toBeInstanceOf(Error);
    // Verificamos que el mensaje del error propagado sea el original (o el que se le haya seteado)
    expect(errorCaught?.message).toBe(SPECIFIC_MESSAGE);


    // Verificaciones de estado/mocks (Solo se ejecutan si el try/catch funciona)
    expect(mockCircuitBreakerStore.setToHalfOpen).toHaveBeenCalledTimes(1);
    // En HALF_OPEN, el 4xx llama a onSuccess
    expect(mockCircuitBreakerStore.incrementSuccesses).toHaveBeenCalledTimes(1); 
    
    // 4. Si el successThreshold es 1 (default), debe cerrar
    expect(mockCircuitBreakerStore.setToClosed).toHaveBeenCalledTimes(1);
    expect(mockInternalBreakerState.state).toBe('CLOSED');
  });

  // --- ESCENARIO 3: Reversión de HALF_OPEN a OPEN con 5xx ---
  it('debe volver inmediatamente a OPEN si falla en HALF_OPEN', async () => {
    // 1. Establecer estado de la sonda
    mockInternalBreakerState.state = 'HALF_OPEN';
    const fail5xxFn = () => Promise.reject(new Error('503 Service Unavailable'));

    // 2. Ejecutar
    await expect(service.execute(KEY, fail5xxFn)).rejects.toThrow();

    // Verificaciones
    // Debe usar onFailure
    expect(mockCircuitBreakerStore.incrementFailures).not.toHaveBeenCalled(); 
    // Debe haber llamado a setToOpen con el flag de liberar lock (true)
    expect(mockCircuitBreakerStore.setToOpen).toHaveBeenCalledWith(KEY, true);
    expect(mockInternalBreakerState.state).toBe('OPEN');
  });

  // --- ESCENARIO 4: Rechazo en OPEN sin Timeout ---
  it('debe lanzar CircuitOpenError si está en OPEN y el timeout no ha expirado', async () => {
    // 1. Establecer estado OPEN
    mockInternalBreakerState.state = 'OPEN';
    mockInternalBreakerState.lastStateChange = Date.now(); // Recién abierto

    const successFn = () => Promise.resolve('data');

    // 2. Ejecutar
    await expect(service.execute(KEY, successFn)).rejects.toThrow(CircuitOpenError);

    // Verificaciones
    expect(mockCircuitBreakerStore.acquireHalfOpenProbeLock).not.toHaveBeenCalled();
    expect(mockCircuitBreakerStore.setToHalfOpen).not.toHaveBeenCalled();
  });

  // --- ESCENARIO 5: Uso de Configuración Personalizada ---
  it('debe respetar los umbrales de fallo personalizados', async () => {
    const CUSTOM_THRESHOLD = 5;
    const failFn = () => Promise.reject(new Error('500 Internal Error'));

    // Simular fallos incrementando el contador en el mock
    mockCircuitBreakerStore.incrementFailures.mockImplementation(async () => {
      mockInternalBreakerState.failures++;
      return mockInternalBreakerState.failures;
    });

    // 4 fallos (Debe permanecer en CLOSED)
    for (let i = 0; i < 4; i++) {
      await expect(service.execute(KEY, failFn, { failureThreshold: CUSTOM_THRESHOLD })).rejects.toThrow();
    }
    expect(mockCircuitBreakerStore.setToOpen).not.toHaveBeenCalled();
    expect(mockInternalBreakerState.failures).toBe(4);
    expect(mockInternalBreakerState.state).toBe('CLOSED');

    // 5to fallo (Debe pasar a OPEN)
    await expect(service.execute(KEY, failFn, { failureThreshold: CUSTOM_THRESHOLD })).rejects.toThrow();
    expect(mockCircuitBreakerStore.setToOpen).toHaveBeenCalledTimes(1);
    expect(mockInternalBreakerState.state).toBe('OPEN');
  });

  // --- ESCENARIO 6: Éxito en CLOSED resetea el contador ---
  it('debe resetear los fallos a 0 al tener un éxito en CLOSED', async () => {
    // Simular 2 fallos previos
    mockInternalBreakerState.failures = 2;
    const successFn = () => Promise.resolve('data');

    // Ejecutar éxito
    await service.execute(KEY, successFn);

    // Verificaciones
    expect(mockCircuitBreakerStore.resetFailures).toHaveBeenCalledTimes(1);
  });
});