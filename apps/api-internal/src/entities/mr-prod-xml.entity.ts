import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('mr_prod_xml')
export class MrProdXml {
  @PrimaryColumn({ type: 'int', name: 'IVR', default: () => '0' })
  ivr: number;

  @PrimaryColumn({ type: 'varchar', length: 50, name: 'CATEGORIA', default: '' })
  categoria: string;

  @Column({ type: 'varchar', length: 8000, name: 'XML_DATA', nullable: true })
  xmlData?: string;

  @Column({ type: 'varchar', length: 50, name: 'MODIFICADO_POR', nullable: true })
  modificadoPor?: string;

  @Column({ type: 'varchar', length: 20, name: 'MODIF_IP', nullable: true })
  modifIp?: string;

  @Column({
    type: 'timestamp',
    name: 'TIMESTAMP',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date;

  @Column({ type: 'int', name: 'VERSION', nullable: true })
  version?: number;

  @Column({ type: 'varchar', length: 32, name: 'MD5SUM', nullable: true })
  md5sum?: string;
}
