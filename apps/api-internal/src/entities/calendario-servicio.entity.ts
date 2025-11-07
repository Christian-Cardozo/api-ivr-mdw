import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'calendario_servicios' })
export class CalendarioServicio {
  @PrimaryColumn({ name: 'CALENDARIO', length: 32 })
  calendario: string;

  @Column({ name: 'VERSION', type: 'int', unsigned: true })
  version: number;

  @Column({ name: 'DESCRIPCION', length: 500 })
  descripcion: string;

  // LUNES
  @Column({ name: 'LUNES_INICIO', type: 'time', default: () => "'00:00:00'" }) lunesInicio: string;
  @Column({ name: 'LUNES_FIN',    type: 'time', default: () => "'00:00:00'" }) lunesFin: string;
  @Column({ name: 'LUNES_DATA1',  length: 200, nullable: true }) lunesData1?: string;
  @Column({ name: 'LUNES_DATA2',  length: 200, nullable: true }) lunesData2?: string;
  @Column({ name: 'LUNES_PROMPT1', length: 10, nullable: true }) lunesPrompt1?: string;
  @Column({ name: 'LUNES_PROMPT2', length: 10, nullable: true }) lunesPrompt2?: string;

  // MARTES
  @Column({ name: 'MARTES_INICIO', type: 'time', default: () => "'00:00:00'" }) martesInicio: string;
  @Column({ name: 'MARTES_FIN',    type: 'time', default: () => "'00:00:00'" }) martesFin: string;
  @Column({ name: 'MARTES_DATA1',  length: 200, nullable: true }) martesData1?: string;
  @Column({ name: 'MARTES_DATA2',  length: 200, nullable: true }) martesData2?: string;
  @Column({ name: 'MARTES_PROMPT1', length: 10, nullable: true }) martesPrompt1?: string;
  @Column({ name: 'MARTES_PROMPT2', length: 10, nullable: true }) martesPrompt2?: string;

  // MIERCOLES
  @Column({ name: 'MIERCOLES_INICIO', type: 'time', default: () => "'00:00:00'" }) miercolesInicio: string;
  @Column({ name: 'MIERCOLES_FIN',    type: 'time', default: () => "'00:00:00'" }) miercolesFin: string;
  @Column({ name: 'MIERCOLES_DATA1',  length: 200, nullable: true }) miercolesData1?: string;
  @Column({ name: 'MIERCOLES_DATA2',  length: 200, nullable: true }) miercolesData2?: string;
  @Column({ name: 'MIERCOLES_PROMPT1', length: 10, nullable: true }) miercolesPrompt1?: string;
  @Column({ name: 'MIERCOLES_PROMPT2', length: 10, nullable: true }) miercolesPrompt2?: string;

  // JUEVES
  @Column({ name: 'JUEVES_INICIO', type: 'time', default: () => "'00:00:00'" }) juevesInicio: string;
  @Column({ name: 'JUEVES_FIN',    type: 'time', default: () => "'00:00:00'" }) juevesFin: string;
  @Column({ name: 'JUEVES_DATA1',  length: 200, nullable: true }) juevesData1?: string;
  @Column({ name: 'JUEVES_DATA2',  length: 200, nullable: true }) juevesData2?: string;
  @Column({ name: 'JUEVES_PROMPT1', length: 10, nullable: true }) juevesPrompt1?: string;
  @Column({ name: 'JUEVES_PROMPT2', length: 10, nullable: true }) juevesPrompt2?: string;

  // VIERNES
  @Column({ name: 'VIERNES_INICIO', type: 'time', default: () => "'00:00:00'" }) viernesInicio: string;
  @Column({ name: 'VIERNES_FIN',    type: 'time', default: () => "'00:00:00'" }) viernesFin: string;
  @Column({ name: 'VIERNES_DATA1',  length: 200, nullable: true }) viernesData1?: string;
  @Column({ name: 'VIERNES_DATA2',  length: 200, nullable: true }) viernesData2?: string;
  @Column({ name: 'VIERNES_PROMPT1', length: 10, nullable: true }) viernesPrompt1?: string;
  @Column({ name: 'VIERNES_PROMPT2', length: 10, nullable: true }) viernesPrompt2?: string;

  // SABADO
  @Column({ name: 'SABADO_INICIO', type: 'time', default: () => "'00:00:00'" }) sabadoInicio: string;
  @Column({ name: 'SABADO_FIN',    type: 'time', default: () => "'00:00:00'" }) sabadoFin: string;
  @Column({ name: 'SABADO_DATA1',  length: 200, nullable: true }) sabadoData1?: string;
  @Column({ name: 'SABADO_DATA2',  length: 200, nullable: true }) sabadoData2?: string;
  @Column({ name: 'SABADO_PROMPT1', length: 10, nullable: true }) sabadoPrompt1?: string;
  @Column({ name: 'SABADO_PROMPT2', length: 10, nullable: true }) sabadoPrompt2?: string;

  // DOMINGO
  @Column({ name: 'DOMINGO_INICIO', type: 'time', default: () => "'00:00:00'" }) domingoInicio: string;
  @Column({ name: 'DOMINGO_FIN',    type: 'time', default: () => "'00:00:00'" }) domingoFin: string;
  @Column({ name: 'DOMINGO_DATA1',  length: 200, nullable: true }) domingoData1?: string;
  @Column({ name: 'DOMINGO_DATA2',  length: 200, nullable: true }) domingoData2?: string;
  @Column({ name: 'DOMINGO_PROMPT1', length: 10, nullable: true }) domingoPrompt1?: string;
  @Column({ name: 'DOMINGO_PROMPT2', length: 10, nullable: true }) domingoPrompt2?: string;

  // Otros
  @Column({ name: 'FERIADOS', type: 'varchar', length: 8000, nullable: true })
  feriados?: string;

  @Column({ name: 'ROLES', type: 'bigint', unsigned: true, default: 0 })
  roles: number;

  @Column({ name: 'CATEGORIA', length: 50, nullable: true })
  categoria?: string;
}
