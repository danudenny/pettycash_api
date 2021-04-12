import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { AccountDailyClosing } from './account-daily-closing.entity';
import { PtcBaseEntity } from './base.entity';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('account_cashbox_item')
export class AccountCashboxItem extends PtcBaseEntity {
  @Column({
    type: 'uuid',
    name: 'account_daily_closing_id',
    nullable: false,
  })
  @Index()
  accountDailyClosingId: string;

  @Column({
    type: 'integer',
    name: 'pieces',
    nullable: false,
  })
  pieces: number;

  @Column({
    type: 'smallint',
    name: 'total',
    nullable: false,
  })
  total: number;

  @Column({
    type: 'decimal',
    name: 'total_amount',
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount?: number;

  @ManyToOne(() => AccountDailyClosing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_daily_closing_id' })
  accountDailyClosing: AccountDailyClosing;
}
