import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../../../../model/branch.entity';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly repo: Repository<Branch>,
  ) {}

  public async list(query: any): Promise<any> {
    const data = await this.repo.find({ where: { isDeleted: false } });

    return { status: 'success', data };
  }

  public static async processQueueData(data: any) {
    // TODO: Process Queue data
  }
}
