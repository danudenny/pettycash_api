import { Entity, Column, JoinColumn, ManyToOne, Index } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { BudgetRequest } from './budget.request.entity';
import { Product } from './product.entity';

@Entity('budget_request_item')
export class BudgetRequestItem extends PtcBaseEntity {
  @Column({ type: 'uuid', name: 'budget_request_id' })
  @Index()
  budgetRequestId: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'numeric', name: 'amount' })
  amount: Number;

  @JoinColumn({ name: 'budget_request_id' })
  budgetRequest: BudgetRequest;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
