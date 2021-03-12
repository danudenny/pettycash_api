import { Entity, Column, Unique, ManyToOne, JoinColumn } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { User } from './user.entity';
import { PeriodState } from './utils/enum';

@Entity('period')
@Unique('unique_year_month', ['year', 'month'])
export class Period extends PtcBaseEntity {
  @Column({ type: 'varchar', length: 250 })
  name: string;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  // This is period "number".
  @Column({ type: 'smallint', name: 'month' })
  month: number;

  @Column({ type: 'smallint', name: 'year' })
  year: number;

  @Column({ type: 'date', name: 'close_date', nullable: true })
  closeDate: Date;

  @Column({ type: 'uuid', name: 'close_user_id', nullable: true })
  closeUserId: string;

  @Column({ type: 'enum', enum: PeriodState, default: PeriodState.OPEN })
  state: PeriodState;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'close_user_id', referencedColumnName: 'id' })
  closeUser: User;
}
