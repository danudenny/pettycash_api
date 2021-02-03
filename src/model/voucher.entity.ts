import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { VoucherState } from './utils/enum';

@Entity('voucher')
export class Voucher extends PtcBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'branch_id',
    nullable: true
  })
  branchId: string;

  @Column({
    type: 'varchar',
    name: 'number',
    nullable: false,
    length: 10,
    unique: true
  })
  number: string;

  @Column({
    type: 'date',
    nullable: false,
    name: 'transaction_date'
  })
  transactionDate: Date;

  @Column({
    type: 'uuid',
    name: 'employee_id',
    nullable: false
  })
  employeeId: string;

  @Column({
    type: 'text',
    name: 'employee_position',
    nullable: false
  })
  employeePosition?: string;

  @Column({
    type: 'timestamp',
    name: 'checkin_time',
    nullable: false
  })
  checkinTime: Date;

  @Column({
    type: 'timestamp',
    name: 'checkout_time',
    nullable: false
  })
  checkoutTime: Date;

  @Column({
    type: 'decimal',
    name: 'total_amount',
    nullable: false,
    default: 0,
    precision: 2
  })
  totalAmount: number;

  @Column({
    name: 'is_realized',
    nullable: false,
    default: () => 'true',
  })
  isRealized: boolean

  @Column({
    type: 'enum',
    enum: VoucherState,
    default: VoucherState.DRAFT
  })
  state: VoucherState
}
