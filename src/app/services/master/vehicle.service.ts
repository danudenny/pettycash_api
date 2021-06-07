import { QueryVehicleDTO } from '../../domain/vehicle/vehicle-payload.dto';
import { Injectable, ParseUUIDPipe } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vehicle } from "../../../model/vehicle.entity";
import { VehicleWithPaginationResponse } from '../../domain/vehicle/vehicle-response.dto';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { AuthService } from '../v1/auth.service';
import { Branch } from '../../../model/branch.entity';

@Injectable()
export class VehicleService {

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>
  ) {}

  public async getAll(query?: QueryVehicleDTO): Promise<VehicleWithPaginationResponse> {
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

    const getBranch =await this.branchRepository.findOne({
      where: {
        id:  userBranchIds[0]
      }
    })

    const params = { limit: 10, ...query };
    const qb = new QueryBuilder(Vehicle, 'veh', params);

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
        (v) => v.in([getBranch.branchId]),
      );
    }

    const vehicles = await qb.exec();
    return new VehicleWithPaginationResponse(vehicles, params)
  }

}