import { ApiProperty } from '@nestjs/swagger';

export class BasePaginationResponse {
  @ApiProperty({
    description: 'Current page number.',
    example: 1,
  })
  page: number = 1;

  @ApiProperty({
    description: 'Previous page number.',
    example: null,
  })
  prevPage: number = this.page - 1;

  @ApiProperty({
    description: 'Next page number.',
    example: 2,
  })
  nextPage: number = this.page + 1;

  @ApiProperty({
    description: 'The maximum number of results data to return.',
    example: 10,
  })
  perPage: number = 10;
}
