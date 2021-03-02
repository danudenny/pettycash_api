import {
  Entity,
  Column,
  JoinColumn,
  OneToMany,
  ManyToOne,
  Index,
} from 'typeorm';
import { ExpenseItemAttribute } from './expense-item-attribute.entity';
import { Expense } from './expense.entity';
import { PtcBaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('expense_item')
export class ExpenseItem extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'expense_id' })
  @Index()
  expenseId: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', name: 'amount', default: 0 })
  amount: Number;

  @Column({
    type: 'decimal',
    name: 'pic_ho_amount',
    default: 0,
    comment: 'Checked Amount by PIC HO',
  })
  picHoAmount: Number;

  @Column({
    type: 'decimal',
    name: 'ss_ho_amount',
    default: 0,
    comment: 'Checked Amount by SS/SPV HO',
  })
  ssHoAmount: Number;

  @Column({ type: 'smallint', name: 'tax', nullable: true })
  tax?: Number;

  @Column({ type: 'text', name: 'checked_note', nullable: true })
  checkedNote?: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: () => 'false',
    name: 'is_valid',
    comment: 'Mark this item as valid (already checked by PIC/SS/SPV)',
  })
  isValid: boolean;

  @OneToMany(() => ExpenseItemAttribute, (e) => e.expenseItem)
  attributes: ExpenseItemAttribute[];

  @JoinColumn({ name: 'expense_id' })
  expense: Expense;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
