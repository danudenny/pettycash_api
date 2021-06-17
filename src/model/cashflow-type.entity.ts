import {
  BaseEntity,
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountCoa } from './account-coa.entity';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('cashflow_type')
export class CashflowType extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'coa_id',
  })
  coaId: string;

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
    default: () => 'true',
    name: 'is_active',
  })
  isActive: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @ManyToOne(() => AccountCoa)
  @JoinColumn({ name: 'coa_id', referencedColumnName: 'id' })
  coaProduct: AccountCoa;
}
