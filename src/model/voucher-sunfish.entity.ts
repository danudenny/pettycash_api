import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PtcBaseEntity } from './base.entity';

@Entity('voucher-sunfish')
export class VoucherSunfish extends PtcBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'date',
    nullable: false,
    name: 'attendance_date'
  })
  attendanceDate: Date;

  @Column({
    type: 'varchar',
    name: 'nik',
    nullable: false,
    length: 25
  })
  nik: string;

  @Column({
    type: 'jsonb',
    name: 'data',
    nullable: false
  })
  data: object;

  @Column({
    name: 'is_processed',
    nullable: false,
    default: () => 'false',
  })
  isProcessed: boolean
}
