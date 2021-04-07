import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { IsUUID } from 'class-validator';
import { Branch } from './branch.entity';

@Entity('voucher_sunfish')
export class VoucherSunfish extends PtcBaseEntity {

  @Column({
    nullable: false,
    name: 'start_time',
  })
  startTime: Date;

  @Column({
    name: 'end_time',
  })
  end_time: Date;

  @Column({
    nullable: false,
    name: 'branch_id',
  })
  @IsUUID()
  branchId: string;

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

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch

}
