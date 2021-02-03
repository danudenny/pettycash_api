import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { BankBranch } from './bank-branch.entity';
import { PtcBaseEntity } from './base.entity';
import { Branch } from './branch.entity';
import { User } from './user.entity';
import { CashBalanceAllocationState } from './utils/enum';

@Entity('cash_balance_allocation')
export class CashBalanceAllocation extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'branch_id' })
  @Index()
  branchId: string;

  @Column({ type: 'varchar', length: 20 })
  number: string;

  @Column({ type: 'date', name: 'transfer_date' })
  transferDate: Date;

  @Column({ type: 'uuid', name: 'responsible_user_id' })
  @Index()
  responsibleUserId: string;

  @Column({ type: 'numeric', name: 'amount', default: 0 })
  amount: Number;

  @Column({ type: 'uuid', name: 'destination_bank_id' })
  destinationBankId: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: CashBalanceAllocationState,
    default: CashBalanceAllocationState.DRAFT,
  })
  state: CashBalanceAllocationState;

  @Column({ type: 'date', name: 'received_date', nullable: true })
  receivedDate?: Date;

  @Column({ type: 'uuid', name: 'received_user_id', nullable: true })
  @Index()
  receivedUserId?: string;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => BankBranch)
  @JoinColumn({ name: 'destination_bank_id' })
  destinationBank: BankBranch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'responsible_user_id', referencedColumnName: 'id' })
  responsibleUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'received_user_id', referencedColumnName: 'id' })
  receivedUser: User;
}
