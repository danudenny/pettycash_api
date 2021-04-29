import { ApiPropertyOptional } from "@nestjs/swagger";
import { BasePayload } from "../common/base-payload.dto";

export class QueryVehicleDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Vehicles Number',
    example: 'B1818FYP',
  })
  vehicleNumber__contains: string;

}
