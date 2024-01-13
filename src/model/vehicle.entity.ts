import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  UpdateDateColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from './utils/transformer';

// NOTE: source data from db master data
@Entity('vehicle')
export class Vehicle extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint', {
    name: 'vehicle_id',
    unique: true,
    transformer: new ColumnNumericTransformer(),
  })
  vehicleId: number;

  @Column('bigint', {
    name: 'branch_id',
    transformer: new ColumnNumericTransformer(),
  })
  branchId: number;

  @Column('varchar', {
    length: 10,
    name: 'vehicle_number',
  })
  vehicleNumber: string;

  @Column('numeric', {
    name: 'vehicle_kilometer',
    transformer: new ColumnNumericTransformer(),
  })
  vehicleKilometer: number;

  @Column('boolean', {
    name: 'is_active',
    default: () => 'true',
  })
  isActive: boolean;

  @Column('bigint', {
    name: 'brand_id',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  brandId: number;

  @Column('bigint', {
    name: 'brand_vehicle_id',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  brandVehicleId: number;

  @Column('varchar', {
    length: 100,
    nullable: true,
    name: 'ownership',
  })
  ownership: string;

  @Column('varchar', {
    length: 100,
    nullable: true,
    name: 'rent_cost',
  })
  rent_cost: string;

  @Column('int', {
    name: 'vehicle_year',
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  vehicleYear: number;

  // additional_notes
  @Column('text', {
    nullable: true,
    name: 'notes',
  })
  notes: string;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'rent_duration_start_date',
  })
  rentDurationStartDate: Date;

  @Column('timestamp without time zone', {
    nullable: true,
    name: 'rent_duration_end_date',
  })
  rentDurationEndDate: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
  })
  updatedAt?: Date;
}
