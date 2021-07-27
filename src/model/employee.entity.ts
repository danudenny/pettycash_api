import { Branch } from './branch.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmployeeRole } from './employee-role.entity';
import { ColumnNumericTransformer } from './utils/transformer';

// NOTE: source data separately from db master data
@Entity('employee')
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'bigint',
    name: 'employee_id',
    unique: true,
    transformer: new ColumnNumericTransformer(),
  })
  employeeId: number;

  @Column({
    type: 'varchar',
    name: 'nik',
  })
  nik: string;

  @Column({
    type: 'varchar',
    name: 'name',
  })
  name: string;

  @Column({
    type: 'int8', // Legacy using `int8`
    nullable: true,
    name: 'employee_role_id',
    transformer: new ColumnNumericTransformer(),
    comment: 'Legacy field master data table `employee.employee_role_id`',
  })
  employeeRoleId: number;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'branch_id',
    transformer: new ColumnNumericTransformer(),
  })
  branchId: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'date_of_entry',
  })
  dateOfEntry: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'date_of_resign',
  })
  dateOfResign: Date;

  @ManyToOne(() => Branch)
  @JoinColumn({
    name: 'branch_id',
    referencedColumnName: 'branchId',
  })
  branch: Branch;

  @ManyToOne(() => EmployeeRole)
  @JoinColumn({
    name: 'employee_role_id',
    referencedColumnName: 'employeeRoleId',
  })
  employeeRole: EmployeeRole;
}