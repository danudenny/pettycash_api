import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../../../model/expense.entity';
import { AuthService } from './auth.service';

export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
  ) {}

  private async getUser() {
    return await AuthService.getUser();
  }

  public async list(query?: any) {
    // TODO: Implement API List Expense
  }

  public async getById(id?: string) {
    // TODO: Implement API Get Expense Detail
  }

  public async create(payload?: any) {
    // TODO: Implement API Create Expense
  }

  public async approve(expenseId: string, payload?: any) {
    // TODO: Implement API Approve Expense
  }

  public async reject(expenseId: string, payload?: any) {
    // TODO: Implement API Reject Expense
  }

  public async listAttachment(query?: any) {
    // TODO: Implement API List Expense Attachments
  }

  public async createAttachment(expenseId: string, payload?: any) {
    // TODO: Implement API Create Expense Attachments
  }

  public async deleteAttachment(expenseId: string, attachmentId: string) {
    // TODO: Implement API Delete Expense Attachments
  }
}
