import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DepartmentService } from '../../../services/master/v1/department.service';
import { DepartmentWithPaginationResponse } from '../../../domain/department/department-response.dto';
import { QueryDepartmentDTO } from '../../../domain/department/department.payload.dto';

@Controller('v1/department')
@ApiTags('Department')
export class DepartmentController {
  constructor(private deptService: DepartmentService) {
  }

  @Get('')
  @ApiOperation({ summary: 'List all Departments' })
  @ApiOkResponse({ type: DepartmentWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryDepartmentDTO){
    return await this.deptService.list(query);
  }

}
