import {
  Entity,
  Column,
  JoinColumn,
  OneToMany,
  ManyToOne,
  Index,
} from 'typeorm';
import { AccountExpenseItemAttribute } from './account-expense-item-attribute.entity';
import { AccountExpense } from './account-expense.entity';
import { PtcBaseEntity } from './base.entity';
import { Product } from './product.entity';

@Entity('account_expense_item')
export class AccountExpenseItem extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'account_expense_id' })
  @Index()
  accountExpenseId: string;

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

  @OneToMany(() => AccountExpenseItemAttribute, (e) => e.accountExpenseItem)
  attributes: AccountExpenseItemAttribute[];

  @JoinColumn({ name: 'account_expense_id' })
  accountExpense: AccountExpense;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
