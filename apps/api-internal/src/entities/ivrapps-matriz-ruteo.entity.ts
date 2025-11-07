import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'ivrapps_matriz_ruteo', schema: 'minddb' })
@Unique('uq_matriz', [
  'calendario',
  'rama',
  'producto',
  'segmento',
  'prefijo',
  'derivacion',
])
@Index('idx_filters', ['calendario', 'rama', 'producto', 'segmento'])
export class IvrappsMatrizRuteo {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 32 })
  calendario: string;

  @Column({ type: 'varchar', length: 64 })
  rama: string;

  @Column({ type: 'varchar', length: 64 })
  producto: string;

  @Column({ type: 'varchar', length: 64 })
  segmento: string;

  @Column({ type: 'varchar', length: 32 })
  prefijo: string;

  @Column({ type: 'varchar', length: 32 })
  derivacion: string;

  @Column({ type: 'int' })
  peso: number;

  @Column({
    type: 'enum',
    enum: ['DEV', 'PREPROD', 'PROD'],
    default: 'PREPROD',
  })
  ambiente: 'DEV' | 'PREPROD' | 'PROD';

  @Column({ type: 'varchar', length: 64 })
  created_by: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'varchar', length: 64, nullable: true })
  updated_by: string | null;

  @UpdateDateColumn({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
