import { QueryVehicleDTO } from './../../domain/vehicle/vehicle-payload.dto';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vehicle } from "../../../model/vehicle.entity";
import { VehicleWithPaginationResponse } from '../../domain/vehicle/vehicle-response.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { AuthService } from '../v1/auth.service';

@Injectable()
export class VehicleService {

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
  ) {}

  public async getAll(query?: QueryVehicleDTO): Promise<VehicleWithPaginationResponse> {
    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(Vehicle, 'veh', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    qb.fieldResolverMap['vehicleNumber__contains'] = 'veh.vehicle_number';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['veh.id', 'id'],
      ['veh.vehicle_id', 'vehicleId'],
      ['veh.branch_id', 'branchId'],
      ['veh.vehicle_number', 'vehicleNumber'],
      ['veh.vehicle_kilometer', 'vehicleKilometer'],
      ['veh.is_active', 'isActive']
    );

    if (userBranchIds?.length && !isSuperUser) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranchIds),
      );
    }

    const vehicles = await qb.exec();
    return new VehicleWithPaginationResponse(vehicles, params)
  }

}