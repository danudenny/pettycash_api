import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
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
    name: 'position_id',
    transformer: new ColumnNumericTransformer(),
    comment: 'Legacy field master data table `employee.employee_role_id`',
  })
  positionId: number;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'position_name',
    comment:
      'Legacy field master data table `employee_role.employee_role_name`',
  })
  positionName: string;

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
}
