import {
  BaseEntity,
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

// NOTE: source data separately from db master data
@Entity('department')
export class Department extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'bigint',
    nullable: false,
    unique: true,
    name: 'department_id',
  })
  @Index()
  departmentId: number;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'department_parent_id',
  })
  departmentParentId: number;

  @Column({
    type: 'varchar',
    length: 25,
    name: 'code',
  })
  code: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'name',
  })
  name: string;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @Column({
    type: 'boolean',
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
