import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from './utils/transformer';

// NOTE: source data separately from db master data
@Entity('employee_role')
export class EmployeeRole extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint', {
    name: 'employee_role_id',
    unique: true,
    transformer: new ColumnNumericTransformer(),
  })
  employeeRoleId: number;

  @Column('bigint', {
    name: 'employee_role_id_parent',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  employeeRoleIdParent: number | null;

  @Column('character varying', {
    name: 'employee_role_code',
    length: 50,
  })
  employeeRoleCode: string;

  @Column('character varying', {
    name: 'employee_role_name',
    length: 225,
  })
  employeeRoleName: string;

  @Column('character varying', {
    name: 'employee_level',
    length: 50,
  })
  employeeLevel: string;

  @Column('character varying', {
    name: 'employee_position',
    length: 50,
  })
  employeePosition: string;

  @Column('text', {
    name: 'description',
  })
  description: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_has_voucher',
  })
  isHasVoucher: boolean;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt?: Date;
}
