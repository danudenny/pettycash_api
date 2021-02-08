import { Entity, Column, JoinTable, ManyToMany } from 'typeorm';
import { AccountCoa } from './account-coa.entity';
import { PtcBaseEntity } from './base.entity';
import {
  AccountFinancialReportDisplayType,
  AccountFinancialReportType,
} from './utils/enum';

@Entity('account_financial_report')
export class AccountFinancialReport extends PtcBaseEntity {
  @Column({ type: 'smallint', name: 'sequence', default: 0 })
  sequence?: Number;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'uuid', name: 'parent_id', nullable: true })
  parentId?: string;

  @Column({ type: 'smallint', name: 'level', default: 0 })
  level?: Number;

  @Column({
    type: 'enum',
    enum: AccountFinancialReportType,
    default: AccountFinancialReportType.SUM,
  })
  type: AccountFinancialReportType;

  @Column({
    type: 'enum',
    enum: AccountFinancialReportDisplayType,
    nullable: true,
  })
  displayType?: AccountFinancialReportDisplayType;

  @Column({
    type: 'smallint',
    nullable: false,
    default: () => '-1',
    comment: `Sign value of report (Nominal Pembalik), value only -1 or 1`,
  })
  sign?: Number;

  @Column({
    type: 'uuid',
    name: 'report_id',
    nullable: true,
    comment: 'Used when `type` is `report`',
  })
  reportId?: string;

  @ManyToMany(() => AccountCoa)
  @JoinTable({
    name: 'account_financial_report_account_coa_rel',
    joinColumn: {
      name: 'account_financial_report_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'account_coa_id',
      referencedColumnName: 'id',
    },
  })
  coaIds?: AccountCoa[];
}
