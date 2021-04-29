import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class VehicleDTO {
  @ApiProperty({
    description: 'Vehicle UUID',
    example: 'b7726b7b-6882-42ea-b623-d8f8a347ba0b',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Vehicles ID (number)',
    example: 1
  })
  vehicleId: number;

  @ApiProperty({
    description: 'Branch ID (number)',
    example: 10
  })
  branchId: number;

  @ApiProperty({
    description: 'Vehicles Number',
    example: 'B1818FYP'
  })
  vehicleNumber: string;

  @ApiProperty({
    description: 'Vehicles Kilometers',
    example: 1000
  })
  vehicleKilometer: number;

  @ApiProperty({
    description: 'Vehicles State',
    example: true
  })
  isActive: boolean;
}