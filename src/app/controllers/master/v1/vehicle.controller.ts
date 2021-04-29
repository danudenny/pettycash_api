import { QueryVehicleDTO } from './../../../domain/vehicle/vehicle-payload.dto';
import { VehicleWithPaginationResponse } from '../../../domain/vehicle/vehicle-response.dto';
import { VehicleService } from './../../../services/master/vehicle.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';

@Controller('v1/vehicles')
@ApiTags('Vehicles')
export class VehicleController {
  constructor(private vehicleService: VehicleService) {}

  @Get('')
  @ApiOperation({ summary: 'List all Products' })
  @ApiOkResponse({ type: VehicleWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryVehicleDTO){
    return await this.vehicleService.getAll(query);
  }
}