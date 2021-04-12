import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { AccountCashboxItem } from './account-cashbox-item.entity';
import { PtcBaseEntity } from './base.entity';
import { Attachment } from './attachment.entity';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('account_daily_closing')
export class AccountDailyClosing extends PtcBaseEntity {
  @Column({
    type: 'uuid',
    name: 'branch_id',
    nullable: false,
  })
  branchId: string;

  @Column({
    type: 'date',
    name: 'closing_date',
    nullable: false,
  })
  closingDate: Date;

  @Column({
    type: 'uuid',
    name: 'responsible_user_id',
    nullable: false,
  })
  responsibleUserId?: string;

  @Column({
    type: 'decimal',
    name: 'opening_bank_amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  openingBankAmount: number;

  @Column({
    type: 'decimal',
    name: 'closing_bank_amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  closingBankAmount: number;

  @Column({
    type: 'decimal',
    name: 'opening_cash_amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  openingCashAmount: number;

  @Column({
    type: 'decimal',
    name: 'closing_cash_amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  closingCashAmount: number;

  @OneToMany(() => AccountCashboxItem, (e) => e.accountDailyClosing, {
    cascade: true,
  })
  cashItems: AccountCashboxItem[];

  @ManyToMany(() => Attachment)
  @JoinTable({
    name: 'account_daily_closing_attachment',
    joinColumn: {
      name: 'account_daily_closing_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attachment_id',
      referencedColumnName: 'id',
    },
  })
  attachments: Attachment[];
}
