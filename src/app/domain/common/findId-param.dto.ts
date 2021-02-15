import { IsUUID } from 'class-validator';

export class FindIdParams {
  @IsUUID()
  id: string;
}

export default FindIdParams;
