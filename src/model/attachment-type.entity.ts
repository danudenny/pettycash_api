import { Column, Entity } from 'typeorm';
import { PtcBaseEntity } from './base.entity';

@Entity('attachment_type')
export class AttachmentType extends PtcBaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'boolean',
    default: () => 'true',
    name: 'is_active',
  })
  isActive: boolean;
}
