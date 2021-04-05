import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('account_coa')
export class AccountCoa extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  // FIXME: use ENUM `AccountCoaInternalType`?
  @Column({ type: 'varchar', name: 'internal_type', nullable: true })
  @Index()
  internalType?: string;

  // TODO: add data from masterdata
}
