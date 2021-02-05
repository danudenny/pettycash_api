import { BaseEntity, Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('account_daily_closing_attachment')
export class AccountDailyClosingAttachment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'uuid',
    name: 'attachment_id',
    nullable: false
  })
  attachmentId: string;


}
