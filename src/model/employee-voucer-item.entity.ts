import { Product } from './product.entity';
import { Employee } from './employee.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';

// NOTE: source data separately from db master data
@Entity('employee_voucher_item')
export class EmployeeVoucherItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'string',
    name: 'employee_id',
  })
  employeeId: string;

  @Column({
    type: 'bigint',
    name: 'product_id',
  })
  productId: string;

  @Column({
    type: 'varchar',
    name: 'allowance_code',
  })
  allowance_code: string;

  @Column({
    type: 'decimal',
    name: 'allowance_amount',
    nullable: false,
  })
  allowance_amount: number;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt?: Date;

  @ManyToOne(() => Employee)
  @JoinColumn({
    name: 'employee_id',
    referencedColumnName: 'id',
  })
  employee: Employee;

  @ManyToOne(() => Product)
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
  })
  product: Product;
}
