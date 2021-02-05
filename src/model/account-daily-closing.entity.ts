import { BaseEntity, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('account_daily_closing')
export class AccountDailyClosing extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'branch_id',
    nullable: false
  })
  branchId: string;

  @Column({
    name: 'closing_date',
    nullable: false
  })
  closingDate: Date;

  @Column({
    type: 'uuid',
    name: 'responsible_user_id',
    nullable: false
  })
  responsibleUserId?: string;

  @Column({
    type: 'decimal',
    name: 'opening_bank_amount',
    default: () => 0,
    precision: 2
  })
  openingBankAmount: number;

  @Column({
    type: 'decimal',
    name: 'closing_bank_amount',
    default: () => 0,
    precision: 2
  })
  closingBankAmount: number;

  @Column({
    type: 'decimal',
    name: 'opening_cash_amount',
    default: () => 0,
    precision: 2
  })
  openingCashAmount: number;

  @Column({
    type: 'decimal',
    name: 'closing_cash_amount',
    default: () => 0,
    precision: 2
  })
  closingCashAmount: number;

  // TODO: Attachment relationship
}
