import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('role')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    name: 'name',
  })
  name: string;

  @Column({
    type: 'boolean',
    name: 'is_active',
    default: true,
  })
  isActive: boolean;

  @Column({
    type: 'boolean',
    name: 'is_deleted',
    default: false,
  })
  isDeleted: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt?: Date;

  @Column({
    type: 'uuid',
    name: 'create_user_id',
  })
  createUserId: string;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt?: Date;

  @Column({
    type: 'uuid',
    name: 'update_user_id',
  })
  updateUserId: string;
}
