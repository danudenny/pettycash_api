import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AttachmentType } from './attachment-type.entity';
import { PtcBaseEntity } from './base.entity';

@Entity('attachment')
export class Attachment extends PtcBaseEntity {
  @Column({
    type: 'text',
    nullable: true,
  })
  url?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
  })
  path?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
  })
  name?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
    name: 'filename',
  })
  fileName?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
    name: 'file_mime',
  })
  fileMime?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
    name: 'file_provider',
  })
  fileProvider?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
    name: 's3_acl',
  })
  s3acl?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 255,
    name: 'bucket_name',
  })
  bucketName?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    nullable: true,
    name: 'type_id',
  })
  typeId: string;

  @Column({
    type: 'boolean',
    name: 'is_checked',
    nullable: true,
    default: false,
  })
  isChecked?: boolean;

  @ManyToOne(() => AttachmentType)
  @JoinColumn({ name: 'type_id', referencedColumnName: 'id' })
  attType: AttachmentType;
}
