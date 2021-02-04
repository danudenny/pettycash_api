import { Entity, Column, JoinColumn, Index } from 'typeorm';
import { AccountExpenseItem } from './account-expense-item.entity';
import { PtcBaseEntity } from './base.entity';

@Entity('account_expense_item_attribute')
export class AccountExpenseItemAttribute extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'account_expense_item_id' })
  @Index()
  accountExpenseItemId: string;

  @Column({ type: 'varchar', name: 'key' })
  key: string;

  @Column({ type: 'varchar', name: 'value' })
  value: string;

  @JoinColumn({ name: 'account_expense_item_id' })
  accountExpenseItem: AccountExpenseItem;
}
