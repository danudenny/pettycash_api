import { IsUUID } from 'class-validator';

export class FindIdParams {
  @IsUUID()
  id: string;
}

export class FindExpenseIdParams {
  @IsUUID()
  expenseId: string;
}

export class FindAttachmentIdParams {
  @IsUUID()
  attachmentId: string;
}

export default FindIdParams;
