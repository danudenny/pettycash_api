import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Branch } from './branch.entity';
import { Role } from './role.entity';

// NOTE: source data from db master data
@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint', {
    nullable: false,
    name: 'user_id',
  })
  userId: number;

  @Column('bigint', {
    nullable: true,
    name: 'employee_id',
  })
  employeeId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'first_name',
  })
  firstName: string;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'last_name',
  })
  lastName: string | null;

  @Column('character varying', {
    nullable: false,
    length: 255,
    name: 'username',
  })
  username: string;

  @Column('integer', {
    nullable: true,
    name: 'login_count',
  })
  loginCount: number | null;

  @Column('integer', {
    nullable: true,
    name: 'login_attempt_error',
  })
  loginAttemptError: number | null;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'last_login',
  })
  lastLogin: Date | null;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_created',
  })
  userIdCreated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'created_time',
  })
  createdTime: Date;

  @Column('bigint', {
    nullable: false,
    name: 'user_id_updated',
  })
  userIdUpdated: number;

  @Column('timestamp without time zone', {
    nullable: false,
    name: 'updated_time',
  })
  updatedTime: Date;

  @Column('boolean', {
    nullable: false,
    default: false,
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('character varying', {
    nullable: true,
    length: 255,
    name: 'email',
  })
  email: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'password_reset',
  })
  passwordReset: string | null;

  @Column('character varying', {
    nullable: true,
    length: 500,
    name: 'otp_reset',
  })
  otpReset: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'role_id',
  })
  roleId?: string;

  // relation model
  @ManyToOne(() => Role)
  @JoinColumn({ referencedColumnName: 'id' })
  role: Role;

  @ManyToMany(() => Branch)
  @JoinTable({
    name: 'user_branch',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'branch_id',
      referencedColumnName: 'id',
    },
  })
  branches: Branch[];

}
