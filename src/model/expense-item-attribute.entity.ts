import { Entity, Column, JoinColumn, Index, ManyToOne } from 'typeorm';
import { ExpenseItem } from './expense-item.entity';
import { PtcBaseEntity } from './base.entity';

@Entity('expense_item_attribute')
export class ExpenseItemAttribute extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'expense_item_id' })
  @Index()
  expenseItemId: string;

  @Column({ type: 'varchar', name: 'key' })
  key: string;

  @Column({ type: 'varchar', name: 'value' })
  value: string;

  @ManyToOne(() => ExpenseItem, (e) => e.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_item_id' })
  expenseItem: ExpenseItem;
}
