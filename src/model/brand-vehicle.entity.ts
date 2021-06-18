import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { ColumnNumericTransformer } from './utils/transformer';

// NOTE: source data from db master data
@Entity('brand_vehicle')
export class Brand extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('bigint', {
    nullable: true,
    name: 'brand_vehicle_id',
    unique: true,
    transformer: new ColumnNumericTransformer(),
  })
  brandVehicleId: number | null;

  @Column('character varying', {
    nullable: false,
    length: 100,
    name: 'brand_vehicle_name',
  })
  brandVehicleName: string;

  @Column('boolean', {
    name: 'is_active',
    nullable: false,
    default: () => 'true',
  })
  isActive: boolean | null;

  @Column('boolean', {
    nullable: false,
    default: () => 'false',
    name: 'is_deleted',
  })
  isDeleted: boolean;
}
