import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { EmployeeService } from '../../../services/master/v1/employee.service';
import {
  EmployeeRoleWithPaginationResponse,
  EmployeeWithPaginationResponse,
} from '../../../domain/employee/employee-response.dto';
import {
  QueryEmployeeDTO,
  QueryEmployeeRoleDTO,
} from '../../../domain/employee/employee.payload.dto';
import { Response } from 'express';
import { BasePayload } from '../../../domain/common/base-payload.dto';

@Controller('v1/employee')
@ApiTags('Employee')
export class EmployeeController {
  constructor(private empService: EmployeeService) {}

  @Get('')
  @ApiOperation({ summary: 'List all Employees' })
  @ApiOkResponse({ type: EmployeeWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async list(@Query() query: QueryEmployeeDTO) {
    return await this.empService.list(query);
  }

  @Get('list-role')
  @ApiOperation({ summary: 'List all Roles' })
  @ApiOkResponse({ type: EmployeeRoleWithPaginationResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  public async listRole(@Query() query?: QueryEmployeeRoleDTO) {
    return await this.empService.employeeRole(query);
  }

  @Get('/export')
  @ApiOperation({ summary: 'Exports Employee to Excel' })
  @ApiOkResponse({ type: Buffer })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async excel(
    @Res() res: Response,
    @Query() query: QueryEmployeeDTO,
  ): Promise<Buffer> {
    try {
      return this.empService.excel(res, query);
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
