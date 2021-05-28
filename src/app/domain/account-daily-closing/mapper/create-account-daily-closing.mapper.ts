import { CreateAccountDailyClosingResponseDTO } from '../dto/create-account-daily-closing-response.dto';

export class CreateAccountDailyClosingMapper {
  public static fromDTO(dto: Partial<CreateAccountDailyClosingResponseDTO>) {
    const it = new CreateAccountDailyClosingResponseDTO();
    it.id = dto.id;

    return it;
  }
}
