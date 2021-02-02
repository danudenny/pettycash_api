import { BaseEntity, Entity, Column, JoinColumn, ManyToOne, Index, PrimaryGeneratedColumn } from 'typeorm';
import { Branch } from './branch.entity';
import { ColumnNumericTransformer } from './utils/transformer';

// NOTE: source data from db master data
@Entity('bank_branch')
export class BankBranch extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint', {
    nullable: true,
    name: 'bank_branch_id',
    unique: true,
    transformer: new ColumnNumericTransformer(),
  })
  @Index()
  bankBranchId: number;

  @Column({
    type: 'bigint',
    name: 'branch_id',
    transformer: new ColumnNumericTransformer(),
    comment: 'Legacy field masterdata'
  })
  @Index()
  branchId: number;

  @Column({
    type: 'bigint',
    name: 'bank_id',
    transformer: new ColumnNumericTransformer(),
    comment: 'Legacy field masterdata table `bank.bank_id`',
  })
  bankId: number;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 100,
    name: 'bank_name',
    comment: 'Legacy field masterdata table `bank.bank_name`',
  })
  bankName?: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'account_number',
  })
  accountNumber: string;

  @Column({
    nullable: true,
    type: 'varchar',
    length: 100,
    name: 'account_holder_name',
  })
  accountHolderName?: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id', referencedColumnName: 'branchId' })
  bank: Branch;
}
