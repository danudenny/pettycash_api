import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

// NOTE: source data separately from db master data
@Entity('employee')
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', {
    nullable: false,
    name: 'nik'
  })
  nik: string;

  @Column('character varying', {
    nullable: false,
    name: 'name'
  })
  name: string;

  @Column('character varying', {
    nullable: false,
    name: 'npwp_number'
  })
  npwpNumber: string;

  @Column('character varying', {
    nullable: false,
    name: 'id_card_number'
  })
  idCardNumber: string;

  @Column('int', {
    nullable: true,
    name: 'id_card_number'
  })
  positionId: number;

  @Column('character varying', {
    nullable: true,
    name: 'position_name'
  })
  positionName: string;

  @Column('int', {
    nullable: true,
    name: 'branch_id'
  })
  branchId: number;

  @Column('character varying', {
    nullable: true,
    name: 'branch_name'
  })
  branchName: string;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted'
  })
  isDeleted: boolean;
}
