import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AccountCoa } from './account-coa.entity';
import { ColumnNumericTransformer } from './utils/transformer';

// NOTE: source data from db master data
@Entity('branch')
export class Branch extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
    unique: true,
    transformer: new ColumnNumericTransformer(),
  })
  branchId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_type_id',
  })
  branchTypeId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_code',
  })
  branchCode: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'branch_name',
  })
  branchName: string;

  @Column('character varying', {
    nullable: true,
    length: 500,
  })
  address: string | null;

  @Column('character varying', {
    nullable: true,
    length: 255,
  })
  phone1: string | null;

  @Column({
    type: 'uuid',
    name: 'cash_coa_id',
    nullable: true,
  })
  cashCoaId?: string;

  @Column('boolean', {
    name: 'is_active',
    nullable: false,
    default: () => 'true',
  })
  isActive: boolean | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('boolean', {
    nullable: true,
    default: () => 'false',
    name: 'is_head_office',
  })
  isHeadOffice: boolean;

  @ManyToOne(() => AccountCoa, { cascade: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'cash_coa_id', referencedColumnName: 'id' })
  cashCoa?: AccountCoa;
}
