import {
  BaseEntity,
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

@Entity('account_coa')
export class AccountCoa extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
