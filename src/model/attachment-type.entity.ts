import { Column, Entity } from 'typeorm';
import { PtcBaseEntity } from './base.entity';
import { AttachmentTypes } from './utils/enum';

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
    type: 'enum',
    enum: AttachmentTypes,
  })
  type: AttachmentTypes;

  @Column({
    type: 'boolean',
    default: () => 'true',
    name: 'is_active',
  })
  isActive: boolean;
}
