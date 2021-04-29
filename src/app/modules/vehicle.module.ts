import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vehicle } from "../../model/vehicle.entity";
import { VehicleController } from "../controllers/master/v1/vehicle.controller";
import { VehicleService } from "../services/master/vehicle.service";

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  providers: [VehicleService],
  controllers: [VehicleController],
  exports: [],
})
export class VehicleModule {}