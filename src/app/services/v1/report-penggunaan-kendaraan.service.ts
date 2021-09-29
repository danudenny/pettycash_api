import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { Response } from 'express';
import axios from 'axios';

@Injectable()
export class ReportPenggunaanKendaraanService {
  constructor() {}

  public async excel(
    res: Response,
    page?: number,
    limit?: number,
    start_date?: any,
    end_date?: any,
    branch_id?: string,
  ): Promise<Buffer> {
    try {
      const { write, utils } = XLSX;

      const emp = await axios.get(
        `http://apipettycashstaging.sicepat.com:7000/pettycash/laporan-penggunaan-kendaraan?page=${page}&limit=${limit}&start_date=${start_date}&end_date=${end_date}&branch_id=${branch_id}`,
      );
      console.log(emp.data.data);
      const heading = [
        ['PT. SiCepat Express Indonesia'],
        ['Data Laporan Penggunaan Kendaraan PT. Sicepat Express Indonesia'],
        [],
        [
          'TGL PENGISIAN',
          'TGL REKAM',
          'NOMOR POLISI',
          'NAMA MERK',
          'TIPE',
          'KODE',
          'CABANG',
          'PARTNER',
          'KETERANGAN',
          'KM PENGISIAN SEBELUMNYA',
          'KM PENGISIAN',
          'BANYAK PENGISIAN',
          'KM PER LITER',
        ],
      ];

      const dtSheet = emp.data.data.map((emp) => {
        return {
          tglPengisian: emp.tglPengisian,
          tglRekam: emp.tglRekam,
          nomorPolisi: emp.nomorPolisi,
          brandName: emp.brandName,
          tipe: emp.tipe,
          representative_code: emp.representative_code,
          cabang: emp.cabang,
          partner: emp.partner,
          description: emp.description,
          kilometerStart: emp.kilometerStart,
          kilometerEnd: emp.kilometerEnd,
          numberOfLiter: emp.numberOfLiter,
          kilometerPerLiter: emp.kilometerPerLiter,
        };
      });

      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet(heading);

      dtSheet['!autofilter'] = { ref: 'B4' };
      utils.sheet_add_json(ws, dtSheet, { origin: 4, skipHeader: true });
      utils.book_append_sheet(wb, ws, 'Laporan Penggunaan Kendaraan');

      let buff = write(wb, { type: 'buffer' });

      const fileName = `laporan-penggunaan-kendaraan-${new Date()}.xlsx`;

      res.setHeader('Content-Disposition', `attachment;filename=${fileName}`);
      res.setHeader(
        'Content-type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.status(200).send(buff);

      return;
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
