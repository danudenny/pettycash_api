import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Voucher } from '../../../model/voucher.entity';
import { VoucherItem } from '../../../model/voucher-item.entity';
import { PrinterService } from '../../../common/services/printer.service';
import express = require('express');

@Injectable()
export class PrintService {
  constructor() {}

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUser({ relations: ['branches'] });
    } else {
      return await AuthService.getUser();
    }
  }

  public async printVoucher(res: express.Response, queryParams: any): Promise<any> {
    // TODO: get data here by queryParams.id
    const printPayload = {
      data: [
        {
          product: 'Uang Bensin',
          value: 10000,
        },
        {
          product: 'Uang Makan',
          value: 5000,
        },
        {
          product: 'Uang Pulsa',
          value: 5000,
        },
      ],
      meta: {
        voucherCode: 'VC/2021/WRFMF12AD',
        transactionDate: '26/04/2021',
        transactionTime: '08:00',
        branchName: 'Kebon Jeruk',
        adminName: 'Andreas',
        driverName: 'Sugiharto',
        nikDriver: '189001',
        position: 'Driver Sigesit',
        totalValue: 20000,
      },
    };

    // if (!printPayload || (printPayload && !printPayload.data)) {
    //   throw new BadRequestException('data tidak ditemukan!');
    // }

    // number of print
    const printCopy = queryParams.printCopy ? queryParams.printCopy : 1;
    const templateConfig = {
      templateName: 'voucher-attendance', // template name on jsreport
      printCopy,
    };
    return this.execPrintVoucher(res, printPayload, templateConfig);
  }

  // func private ============================================================
  private async execPrintVoucher(
    res: express.Response,
    data: Partial<any>,
    templateConfig: {
      templateName: string;
      printCopy: number;
    },
  ) {
    // const listPrinterName = ['BarcodePrinter', 'StrukPrinter'];
    PrinterService.responseForJsReport({
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
