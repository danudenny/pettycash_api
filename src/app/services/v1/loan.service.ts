import { Injectable } from '@nestjs/common';

@Injectable()
export class LoanService {
  constructor() {}

  public async list(payload?: any) {}
  public async getById(id: string) {}
  public async pay(id: string, payload?: any) {}
}
