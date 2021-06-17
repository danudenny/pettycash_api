import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountCoa } from './account-coa.entity';
import { PtcBaseEntity } from './base.entity';

@Entity('cashflow_type')
export class CashflowType extends PtcBaseEntity {
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

  @Column('boolean', {
    nullable: false,
    default: () => 'true',
    name: 'is_active',
  })
  isActive: boolean;

  @ManyToOne(() => AccountCoa)
  @JoinColumn({ name: 'coa_id', referencedColumnName: 'id' })
  coaProduct: AccountCoa;
}
