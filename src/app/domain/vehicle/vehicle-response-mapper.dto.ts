import { Vehicle } from "../../../model/vehicle.entity";
import { VehicleDTO } from "./vehicle.dto";

export class VehicleResponseMapper {
  public static toDTO(dto: Partial<VehicleDTO>): VehicleDTO {
    const it = new VehicleDTO();
    it.id = dto.id;
    it.vehicleId = dto.vehicleId;
    it.branchId = dto.branchId;
    it.vehicleNumber = dto.vehicleNumber;
    it.vehicleKilometer = dto.vehicleKilometer;
    it.isActive = dto.isActive;
    return it;
  }

  public static fromOneEntity(ety: Partial<Vehicle>) {
    return this.toDTO({
      id: ety.id,
      vehicleId: ety.vehicleId,
      branchId: ety.branchId,
      vehicleNumber: ety.vehicleNumber,
      vehicleKilometer: ety.vehicleKilometer,
      isActive: ety.isActive,
    });
  }

  public static fromManyEntity(entities: Partial<Vehicle[]>) {
    return entities.map((e) => VehicleResponseMapper.fromOneEntity(e));
  }

  public static toManyDTO(entities: Partial<VehicleDTO[]>) {
    return entities.map((e) => VehicleResponseMapper.toDTO(e));
  }

  public static fromDTO(
    data: Partial<VehicleDTO | VehicleDTO[]>,
  ): VehicleDTO | VehicleDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }

  public static fromEntity(
    entities: Partial<Vehicle | Vehicle[]>,
  ): VehicleDTO | VehicleDTO[] {
    if (!Array.isArray(entities)) {
      return this.fromOneEntity(entities);
    } else {
      return this.fromManyEntity(entities);
    }
  }
}