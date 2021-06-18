import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { ColumnNumericTransformer } from './utils/transformer';

// NOTE: source data from db master data
@Entity('representative')
export class Representative extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint', {
    nullable: true,
    name: 'representative_id',
    unique: true,
    transformer: new ColumnNumericTransformer(),
  })
  representativeId: number | null;

  @Column('bigint', {
    nullable: true,
    name: 'branch_id',
    transformer: new ColumnNumericTransformer(),
  })
  branchId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'representative_code',
  })
  representativeCode: string;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'representative_name',
  })
  representativeName: string;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'email',
  })
  email: string;

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
}
