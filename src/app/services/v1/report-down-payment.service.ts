import * as XLSX from 'xlsx';
import { Response } from 'express';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { DownPayment } from '../../../model/down-payment.entity';
import { QueryReportDownPaymentDTO } from '../../domain/report-down-payment/report-down-payment-query.dto';
import { ReportDownPaymentsWithPaginationResponse } from '../../domain/report-down-payment/report-down-payment-response.dto';

@Injectable()
export class ReportDownPaymentService {
  public async getAllReport(
    query?: QueryReportDownPaymentDTO,
  ): Promise<ReportDownPaymentsWithPaginationResponse> {
    try {
      const params = { order: '^created_at', limit: 10, ...query };

      const qb = new QueryBuilder(DownPayment, 'dp', params);

      qb.fieldResolverMap['branchId'] = 'dp.branch_id';
      qb.fieldResolverMap['startDate__gte'] = 'dp.transaction_date';
      qb.fieldResolverMap['endDate__lte'] = 'dp.transaction_date';

      qb.applyFilterPagination();
      qb.selectRaw(
        ['dp.id', 'id'],
        ['dp.number', 'numberDownPayment'],
        ['dp.amount', 'amountDownPayment'],
        ['exp.total_amount', 'amountRealized'],
        ['dp.transaction_date', 'transactionDate'],
        ['brc.branchName', 'branchName'],
        ['exp.number', 'numberExpense'],
        ['exp.source_document', 'sourceDocumentExpense'],
        ['ln.paid_amount', 'amountRepayment'],
      );
      qb.leftJoin((e) => e.branch, 'brc');
      qb.leftJoin((e) => e.expense, 'exp');
      qb.qb.leftJoin(`loan`, 'ln', 'ln.source_document = exp.number');
      qb.andWhere(
        (e) => e.isDeleted,
        (v) => v.isFalse(),
      );

      if (query && query.realized === 'sudah_realisasi') {
        qb.andWhereIsolated((q) =>
          q.andWhere(
            (e) => e.expenseId,
            (w) => w.isNotNull(),
          ),
        );
      } else if (query && query.realized === 'belum_realisasi') {
        qb.andWhereIsolated((q) =>
          q.andWhere(
            (e) => e.expenseId,
            (w) => w.isNull(),
          ),
        );
      }

      const reportDownPayment = await qb.exec();

      return new ReportDownPaymentsWithPaginationResponse(
        reportDownPayment,
        params,
      );
    } catch (err) {
      throw new HttpException(
        err.message,
        err.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async export(res: Response, query?: QueryReportDownPaymentDTO): Promise<Buffer> {
    try {
      const { read, write, utils } = XLSX;
      const params = { order: '^created_at', limit: 10, ...query };

      const qb = new QueryBuilder(DownPayment, 'dp', params);

      qb.fieldResolverMap['branchId'] = 'dp.branch_id';
      qb.fieldResolverMap['startDate__gte'] = 'dp.transaction_date';
      qb.fieldResolverMap['endDate__lte'] = 'dp.transaction_date';

      qb.applyFilterPagination();
      qb.selectRaw(
        ['dp.id', 'id'],
        ['dp.number', 'numberDownPayment'],
        ['dp.amount', 'amountDownPayment'],
        ['exp.total_amount', 'amountRealized'],
        ['dp.transaction_date', 'transactionDate'],
        ['brc.branchName', 'branchName'],
        ['exp.number', 'numberExpense'],
        ['exp.source_document', 'sourceDocumentExpense'],
        ['ln.paid_amount', 'amountRepayment'],
      );
      qb.leftJoin((e) => e.branch, 'brc');
      qb.leftJoin((e) => e.expense, 'exp');
      qb.qb.leftJoin(`loan`, 'ln', 'ln.source_document = exp.number');
      qb.andWhere(
        (e) => e.isDeleted,
        (v) => v.isFalse(),
      );

      if (query && query.realized === 'sudah_realisasi') {
        qb.andWhereIsolated((q) =>
          q.andWhere(
            (e) => e.expenseId,
            (w) => w.isNotNull(),
          ),
        );
      } else if (query && query.realized === 'belum_realisasi') {
        qb.andWhereIsolated((q) =>
          q.andWhere(
            (e) => e.expenseId,
            (w) => w.isNull(),
          ),
        );
      }

      const reportDownPayment = await qb.exec();

      let startDate = this.formatDate(query && query?.startDate__gte || new Date(), "id")
      let endDate = this.formatDate(query && query?.endDate__lte || new Date(), "id")
      /* Define Header*/
      const heading = [
        ["PT. SiCepat Express Indonesia"], [],
        [`Data Uang Muka Mulai: ${startDate+' Sampai Dengan '+endDate}`], [],
        ["No Transaksi Uang Muka", "Source Document", "Branch", "Nilai Uang Muka", "Nilai Realisasi", "Pelunasan"],
      ];

      const dtSheet = reportDownPayment.map((t) => {
        return {
          numberDownPayment: t.numberDownPayment,
          sourceDocumentExpense: t.sourceDocumentExpense,
          branchName: t.branchName,
          amountDownPayment: t.amountDownPayment,
          numberExpense: t.numberExpense,
          amountRepayment: t.amountRepayment,
        }
      })

      /* merge cells*/
      const mergeCop = { s: { c: 0, r: 0 }, e: { c: 5, r: 0 } };
      const mergeRangeDate = { s: { c: 0, r: 2 }, e: { c: 5, r: 2 } };
      // const DmergeCop = utils.decode_range("A1:F1"); // this is equivalent
      // const DmergeRangeDate = utils.decode_range("A3:F3"); // this is equivalent
      // console.log(DmergeCop, DmergeRangeDate);

      /* generate workbook */
      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet(heading);
      /* add merges */
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push(mergeCop);
      ws['!merges'].push(mergeRangeDate);
      /* Write data */
      utils.sheet_add_json(ws, dtSheet, { origin : 5, skipHeader: true})
      utils.book_append_sheet(wb, ws, "Report Uang Muka");

      /* generate buffer */
      // var buf = writeFile(wb, `report-auang-muka-${startDate+ '-' +endDate}`,{ type: 'buffer' });
      var buf = write(wb,{ type: 'buffer' });
      /* send to client */
      res.status(200).header('Content-Disposition', `attachment; filename= report-uang-muka.xlsx`).type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').send(buf);

      return
    } catch (err) {
      throw new HttpException(err.message, err.status || HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get a format date y-m-d
   * @param {string} date - request date.
   * @return {formatDateFn} format date y-m-d
  */
  formatDate(date: Date, lang:string='en') {
    var d = new Date(date),
        gd = d.getDate(),
        month = this.convertMonth(d.getMonth(), lang),
        year = d.getFullYear();
    
    return gd+' '+month+' '+year;
  }
  /**
   * Get a month
   * @param {number} month - value month
   * @param {lang} string - value en or id
   * @return {convertMonthFn} month
  */
  convertMonth(month: number, lang:string = 'en') {
      var month = <number>month;
      var arr_month = [];
      var month_converted = '';

      switch (lang) {
        case 'id':
            arr_month = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'Nopember', 'Desember'];
            break;

        default:
            arr_month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            break;
      }

      if (this.arrayKeyExists(month, arr_month)) {
          month_converted = arr_month[month];
      }

      return month_converted;
  }
  /**
   * @param {number} key - value 
   * @param {search} any - value array or object
   * @return {arrayKeyExistsFn} month
  */
  arrayKeyExists(key: number, search: any) { // eslint-disable-line camelcase

    if (!search || (search.constructor !== Array && search.constructor !== Object)) {
        return false
    }
    return key in search
  }
}
