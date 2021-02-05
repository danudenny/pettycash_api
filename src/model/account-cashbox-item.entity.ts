import { BaseEntity, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('account_cashbox_item')
export class AccountCashboxItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'account_daily_closing_id',
    nullable: false
  })
  accountDailyClosingId: string;

  @Column({
    type: 'smallint',
    name: 'pieces',
    nullable: false
  })
  pieces: number;

  @Column({
    type: 'smallint',
    name: 'total',
    nullable: false
  })
  total: number;

  @Column({
    type: 'decimal',
    name: 'total_amount',
    default: 0,
    precision: 2
  })
  totalAmount?: number;
}
