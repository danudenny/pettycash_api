import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponse } from '../common/base-response.dto';
import { Expense } from '../../../model/expense.entity';
import { ExpenseDetailResponseMapper } from './response-detail.mapper';
import { ExpenseDetailDTO } from './expense-detail.dto';

export class ExpenseDetailResponse extends BaseResponse {
  constructor(data?: Partial<Expense>) {
    super();
    if (data) {
      this.data = ExpenseDetailResponseMapper.fromEntity(data);
    }
  }

  @ApiPropertyOptional({ type: () => ExpenseDetailDTO })
  data?: ExpenseDetailDTO = null;
}
