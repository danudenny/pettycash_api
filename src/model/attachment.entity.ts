import { Column, Entity } from 'typeorm';
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
    length: 255,
    name: 'bucket_name',
  })
  bucketName?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;
}