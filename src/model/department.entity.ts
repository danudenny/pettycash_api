import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

// NOTE: source data separately from db master data
@Entity('department')
export class Department extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint', {
    nullable: true,
    name: 'parent_id',
  })
  parentId: number;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'code',
  })
  code: string;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'name',
  })
  name: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
