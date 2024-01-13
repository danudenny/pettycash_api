import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { BasePayload } from "../common/base-payload.dto";

export class QueryAttachmentTypeDTO extends BasePayload {
  @ApiPropertyOptional({
    description: 'Att Type ID to filter',
    example: '551ecae4-f27c-49f7-a159-934739c2d426',
  })
  @IsOptional()
  @IsUUID()
  id: string;

  @ApiPropertyOptional({
    description: 'Search by Att Type Code (using LIKE sql)',
    example: '500',
  })
  code__icontains: string;

  @ApiPropertyOptional({
    description: 'Search by Att Type Name (using LIKE sql)',
    example: 'KTP',
  })
  name__icontains: string;
}