import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Journal } from '../../../model/journal.entity';
import { JournalWithPaginationResponse } from '../../domain/journal/response.dto';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal)
    private readonly journalRepo: Repository<Journal>,
  ) {}

  public async list(query?: any): Promise<JournalWithPaginationResponse> {
    // TODO: Implement API list journal
    const journals = await this.journalRepo.find({
      where: { isDeleted: false },
      relations: ['items', 'period'],
    });
    return new JournalWithPaginationResponse(journals, {});
  }

  public async approve(id: string): Promise<any> {
    // TODO: Implement API approve journal
  }

  public async post(id: string): Promise<any> {
    // TODO: Implement API post journal
  }

  public async reverse(id: string, payload: any): Promise<any> {
    // TODO: Implement API reverse journal
  }
}
