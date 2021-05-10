import { Entity, Unique, Column, JoinTable, ManyToMany } from 'typeorm';
import { Attachment } from './attachment.entity';
import { PtcBaseEntity } from './base.entity';
import { PartnerState, PartnerType } from './utils/enum';

@Entity('partner')
export class Partner extends PtcBaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    name: 'code',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 250,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'address',
  })
  address?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'email',
  })
  email?: string;

  @Column({
    type: 'varchar',
    length: 25,
    nullable: true,
    name: 'mobile',
  })
  mobile?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'website',
  })
  website?: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
    name: 'npwp_number',
  })
  npwpNumber?: string;

  @Column({
    type: 'varchar',
    length: 25,
    nullable: true,
    name: 'id_card_number',
  })
  idCardNumber?: string;

  @Column({
    type: 'enum',
    enum: PartnerState,
    default: PartnerState.DRAFT,
  })
  state: PartnerState;

  @Column({
    type: 'enum',
    enum: PartnerType,
    default: PartnerType.COMPANY,
  })
  type: PartnerType;

  @ManyToMany(() => Attachment)
  @JoinTable({
    name: 'partner_attachment',
    joinColumn: {
      name: 'partner_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'attachment_id',
      referencedColumnName: 'id',
    },
  })
  attachments: Attachment[];
}
