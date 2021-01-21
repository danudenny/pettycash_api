import {
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export abstract class PtcBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column({ type: 'boolean', name: 'is_active', default: true })
  // isActive: boolean;

  @Column({ type: 'boolean', name: 'is_deleted', default: false })
  isDeleted: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt?: Date;

  @Column({ type: 'uuid', name: 'create_user_id' })
  createUserId: string;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt?: Date;

  @Column({ type: 'uuid', name: 'update_user_id' })
  updateUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'create_user_id' })
  createUser: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'update_user_id' })
  updateUser: User;
}
