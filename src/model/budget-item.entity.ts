import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { Budget } from './budget.entity';
import { Product } from './product.entity';

@Entity('budget_item')
export class BudgetItem extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'budget_id' })
  @Index()
  budgetId: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', name: 'amount' })
  amount: Number;

  @JoinColumn({ name: 'budget_id' })
  budget: Budget;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
