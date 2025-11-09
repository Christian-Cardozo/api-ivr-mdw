import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Index('Index 4', ['ani', 'dnis'], { unique: true })
@Index('Usuario_app', ['usuario', 'aplicacion'])
@Index('orden', ['ani', 'dnis', 'instancia', 'habilitado', 'orden'])
@Entity('ivrtools_escenarios')
export class IvrtoolsEscenarios {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, name: 'ID' })
  id: number;

  @Column({ type: 'varchar', length: 12, name: 'ANI' })
  ani: string;

  @Column({ type: 'tinyint', unsigned: true, name: 'Orden', default: 1 })
  orden: number;

  @Column({ type: 'tinyint', name: 'Habilitado' })
  habilitado: number;

  @Column({ type: 'varchar', length: 40, name: 'Categoria', default: '' })
  categoria: string;

  @Column({ type: 'varchar', length: 255, name: 'Descripcion', nullable: true })
  descripcion?: string;

  @Column({ type: 'varchar', length: 16000, name: 'Variables', default: '' })
  variables: string;

  @Column({ type: 'varchar', length: 30, name: 'Usuario', default: '' })
  usuario: string;

  @Column({ type: 'varchar', length: 32, name: 'Aplicacion', nullable: true, default: '' })
  aplicacion?: string;

  @Column({ type: 'varchar', length: 10, name: 'DNIS', nullable: true, default: '' })
  dnis?: string;

  @Column({ type: 'varchar', length: 50, name: 'INSTANCIA', nullable: true, default: '' })
  instancia?: string;

  @Column({ type: 'bigint', unsigned: true, name: 'ID_Escenario', nullable: true })
  idEscenario?: number;
}
