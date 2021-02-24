import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaxService } from '../../../services/master/v1/tax.service';
import { TaxResponse } from '../../../domain/tax/tax-response.dto';
import { QueryTaxDTO } from '../../../domain/tax/tax.payload.dto';
import { EmployeeService } from '../../../services/master/v1/employee.service';
import { EmployeeResponse, EmployeeWithPaginationResponse } from '../../../domain/employee/employee-response.dto';
import { QueryEmployeeDTO } from '../../../domain/employee/employee.payload.dto';

@Controller('v1/employee')
@ApiTags('Employee')
export class EmployeeController {
  constructor(private empService: EmployeeService) {
  }

  @Get('')
  @ApiOperation({ summary: 'List all Employees' })
  @ApiOkResponse({ type: EmployeeWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryEmployeeDTO) {
    return await this.empService.list(query);
  }
}
