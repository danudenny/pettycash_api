import { BaseEntity, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('account_coa')
export class AccountCoa extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId?: string;

  @Column('bigint', {
    nullable: true,
    name: 'coa_id',
    unique: true,
    transformer: new ColumnNumericTransformer(),
    comment: 'Legacy field master data `account_coa_id`',
  })
  coaId?: number;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'varchar', name: 'internal_type', nullable: true })
  internalType?: string;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_created',
    transformer: new ColumnNumericTransformer(),
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: true,
    name: 'user_id_updated',
    transformer: new ColumnNumericTransformer(),
  })
  userIdUpdated: number;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_active',
  })
  isActive: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
