import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BranchService } from '../../../services/master/v1/branch.service';

@ApiTags('Master Branch')
@Controller('v1/master/branches')
export class BranchController {
  constructor(private svc: BranchService) {}

  @Get()
  public async list(@Query() query: any) {
    return await this.svc.list(query);
  }
}
