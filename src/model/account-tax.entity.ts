import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { AccountCoa } from './account-coa.entity';
import { PtcBaseEntity } from './base.entity';
import { AccountTaxPartnerType } from './utils/enum';

@Entity('account_tax')
export class AccountTax extends PtcBaseEntity {
  @Column({
    type: 'varchar',
    name: 'name',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: () => 'false',
    name: 'is_has_npwp',
  })
  isHasNpwp: boolean;

  @Column({ type: 'decimal', name: 'tax_in_percent', default: 0 })
  taxInPercent: number;

  @Column({ type: 'enum', enum: AccountTaxPartnerType, name: 'partner_type' })
  partnerType: AccountTaxPartnerType;

  @Column({ type: 'uuid', name: 'coa_id', nullable: true })
  coaId?: string;

  @ManyToOne(() => AccountCoa)
  @JoinColumn({ name: 'coa_id' })
  coa: AccountCoa;
}
