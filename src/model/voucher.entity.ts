import { Column, Entity, JoinColumn, OneToMany, ManyToOne } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { Employee } from './employee.entity';
import { VoucherState } from './utils/enum';
import { VoucherItem } from './voucher-item.entity';

@Entity('voucher')
export class Voucher extends PtcBaseEntity {
  @Column({
    type: 'uuid',
    name: 'branch_id',
    nullable: true,
  })
  branchId: string;

  @Column({
    type: 'varchar',
    name: 'number',
    nullable: false,
    length: 25,
    unique: true,
  })
  number: string;

  @Column({
    type: 'date',
    nullable: false,
    name: 'transaction_date',
    default: () => 'CURRENT_DATE',
  })
  transactionDate: Date;

  @Column({
    type: 'uuid',
    name: 'employee_id',
    nullable: false,
  })
  employeeId: string;

  @Column({
    type: 'varchar',
    name: 'employee_position',
    length: 250,
    nullable: true,
  })
  employeePosition?: string;

  @Column({
    type: 'timestamp',
    name: 'checkin_time',
    nullable: false,
  })
  checkinTime: Date;

  @Column({
    type: 'timestamp',
    name: 'checkout_time',
    nullable: false,
  })
  checkoutTime: Date;

  @Column({
    type: 'decimal',
    name: 'total_amount',
    nullable: false,
    default: 0,
  })
  totalAmount: number;

  @Column({
    type: 'boolean',
    name: 'is_realized',
    nullable: false,
    default: () => 'true',
  })
  isRealized: boolean;

  @Column({
    type: 'enum',
    enum: VoucherState,
    default: VoucherState.DRAFT,
  })
  state: VoucherState;

  @OneToMany(() => VoucherItem, (voucherItem) => voucherItem.voucher)
  items: VoucherItem[];

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;
}
