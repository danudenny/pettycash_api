import { Injectable, NotFoundException } from '@nestjs/common';
import { Voucher } from '../../../model/voucher.entity';
import { PrinterService } from '../../../common/services/printer.service';
import express = require('express');
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoucherService } from './voucher.service';

@Injectable()
export class PrintService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
    private voucherService: VoucherService
  ) {}

  public async printVoucher(res: express.Response, id: string, queryParams: any): Promise<any> {
    const voucherDetail = await this.voucherService.getById(id)

    if (!voucherDetail) {
      throw new NotFoundException(`Voucher ID ${id} tidak ditemukan!`);
    }

    // number of print
    const printCopy = queryParams.printCopy ? queryParams.printCopy : 1;
    const templateConfig = {
      templateName: 'voucher-attendance',
      printCopy,
    };
    return PrintService.execPrintVoucher(res, voucherDetail, templateConfig);
  }

  private static async execPrintVoucher(
    res: express.Response,
    data: Partial<any>,
    templateConfig: {
      templateName: string;
      printCopy: number;
    },
  ) {
    await PrinterService.responseForJsReport({
      res,
      templates: [
        {
          templateName: templateConfig.templateName,
          templateData: data,
          printCopy: templateConfig.printCopy,
        },
      ],
    });
  }
}
