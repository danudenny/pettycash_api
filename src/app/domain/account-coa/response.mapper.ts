import { AccountCoa } from '../../../model/account-coa.entity';
import { AccountCoaDTO } from './accounta-ca.dto';

export class AccountCoaResponseMapper {
  public static toDTO(dto: Partial<AccountCoaDTO>): AccountCoaDTO {
    const it = new AccountCoaDTO();
    it.id = dto.id;
    it.code = dto.code;
    it.name = dto.name;
    return it;
  }

  public static toManyDTO(dtos: Partial<AccountCoaDTO[]>) {
    return dtos.map((d) => AccountCoaResponseMapper.toDTO(d));
  }

  public static fromDTO(
    data: Partial<AccountCoaDTO | AccountCoaDTO[]>,
  ): AccountCoaDTO | AccountCoaDTO[] {
    if (!Array.isArray(data)) {
      return this.toDTO(data);
    } else {
      return this.toManyDTO(data);
    }
  }
}
