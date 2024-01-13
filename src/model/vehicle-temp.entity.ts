import {
  Column,
  Entity,
  PrimaryColumn,
  BaseEntity,
  CreateDateColumn,
} from 'typeorm';
import { ColumnNumericTransformer } from './utils/transformer';

@Entity('vehicle_temp')
export class VehicleTemp extends BaseEntity {
  @PrimaryColumn('uuid', {
    name: 'pettycash_vehicle_id',
  })
  pettycashVehicleId: string;

  @Column('bigint', {
    name: 'masterdata_vehicle_id',
    transformer: new ColumnNumericTransformer(),
  })
  masterdataVehicleId: number;

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

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
  })
  createdAt?: Date;
}
