import { IsUUID } from 'class-validator';

export class FindIdParams {
  @IsUUID()
  id: string;
}

export class FindExpenseIdParams {
  @IsUUID()
  expenseId: string;
}
export class FindPartnerIdParams {
  @IsUUID()
  partnerId: string;
}
export class FindAttachmentIdParams {
  @IsUUID()
  attachmentId: string;
}

export class FindVoucherIdParams {
  @IsUUID()
  voucherId: string;
}

export default FindIdParams;
