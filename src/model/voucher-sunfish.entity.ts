import { Column, Entity } from 'typeorm';
import { PtcBaseEntity } from './base.entity';

@Entity('voucher_sunfish')
export class VoucherSunfish extends PtcBaseEntity {
  @Column({
    type: 'date',
    nullable: false,
    name: 'attendance_date',
  })
  attendanceDate: Date;

  @Column({
    type: 'varchar',
    name: 'nik',
    length: 25,
    nullable: false,
  })
  nik: string;

  @Column({
    type: 'jsonb',
    name: 'data',
    nullable: false,
  })
  data: object;

  @Column({
    name: 'is_processed',
    nullable: false,
    default: () => 'false',
  })
  isProcessed: boolean;
}
