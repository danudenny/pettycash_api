import { ApiPropertyOptional } from "@nestjs/swagger";
import { BasePaginationResponse } from "../common/base-pagination-response.dto";
import { BaseResponse } from "../common/base-response.dto";
import { PaginationBuilder } from "../common/pagination-builder";
import { VehicleResponseMapper } from "./vehicle-response-mapper.dto";
import { VehicleDTO } from "./vehicle.dto";

export class VehicleResponse extends BaseResponse {
  constructor(data?: Partial<VehicleDTO | VehicleDTO[]>) {
    super();
    if (data) {
      this.data = VehicleResponseMapper.fromDTO(data);
    }
  }

  @ApiPropertyOptional({ type: () => [VehicleDTO] })
  data?: VehicleDTO | VehicleDTO[] = null;
}

export class VehicleWithPaginationResponse extends BaseResponse {
  constructor(data?: Partial<VehicleDTO | VehicleDTO[]>, params?: any) {
    super();
    if (data) {
      this.data = VehicleResponseMapper.fromDTO(data);
      this.meta = PaginationBuilder.build(data, params);
    }
  }

  @ApiPropertyOptional({ type: () => [VehicleDTO] })
  data?: VehicleDTO | VehicleDTO[] = null;

  @ApiPropertyOptional({ type: () => BasePaginationResponse })
  meta?: BasePaginationResponse;
}