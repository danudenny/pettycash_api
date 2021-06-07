import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';
import { ColumnNumericTransformer } from './utils/transformer';

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
}
