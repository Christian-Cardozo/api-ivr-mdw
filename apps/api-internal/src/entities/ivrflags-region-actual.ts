import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ivrflags_region_actual')
export class IvrflagsRegionActual {
  @PrimaryColumn({ type: 'int', name: 'FLAG', default: () => '0' })
  flag: number;

  @PrimaryColumn({ type: 'varchar', length: 30, name: 'REGION', default: '' })
  region: string;

  @Column({ type: 'int', name: 'NIVEL', nullable: true })
  nivel?: number;

  @Column({ type: 'varchar', length: 100, name: 'MOTIVO', nullable: true })
  motivo?: string;

  @Column({ type: 'varchar', length: 100, name: 'HOST', nullable: true })
  host?: string;

  @Column({ type: 'varchar', length: 100, name: 'USUARIO', nullable: true })
  usuario?: string;

  @Column({
    type: 'timestamp',
    name: 'TIMESTAMP',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  timestamp: Date;

  @Column({ type: 'int', name: 'NIVEL_ANTERIOR', nullable: true })
  nivelAnterior?: number;

  @Column({
    type: 'timestamp',
    name: 'TS_ANTERIOR',
    default: () => "'0000-00-00 00:00:00'",
  })
  tsAnterior: Date;
}
