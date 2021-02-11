import {
  BaseEntity,
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountCoa } from './account-coa.entity';
import { Partner } from './partner.entity';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('global_setting')
export class GlobalSetting extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'voucher_partner_id',
    nullable: true,
  })
  voucherPartnerId: string;

  @Column({
    type: 'numeric',
    name: 'deviation_amount',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  deviationAmount: Number;

  @Column({
    type: 'uuid',
    name: 'cash_transit_coa_id',
    nullable: true,
  })
  cashTransitCoaId: string;

  @Column({
    type: 'uuid',
    name: 'down_payment_perdin_coa_id',
    nullable: true,
  })
  downPaymentPerdinCoaId: string;

  @Column({
    type: 'uuid',
    name: 'down_payment_reimbursement_coa_id',
    nullable: true,
  })
  downPaymentReimbursementCoaId: string;

  @OneToOne(() => Partner)
  @JoinColumn({ name: 'voucher_partner_id' })
  voucherPartner: Partner;

  @OneToOne(() => AccountCoa)
  @JoinColumn({ name: 'cash_transit_coa_id' })
  cashTransitCoa: AccountCoa;

  @OneToOne(() => AccountCoa)
  @JoinColumn({ name: 'down_payment_perdin_coa_id' })
  downPaymentPerdinCoa: AccountCoa;

  @OneToOne(() => AccountCoa)
  @JoinColumn({ name: 'down_payment_reimbursement_coa_id' })
  downPaymentReimbursementCoa: AccountCoa;
}
