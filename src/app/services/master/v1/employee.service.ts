import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Employee } from '../../../../model/employee.entity';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { QueryEmployeeDTO } from '../../../domain/employee/employee.payload.dto';
import { EmployeeWithPaginationResponse } from '../../../domain/employee/employee-response.dto';
import * as XLSX from 'xlsx';
import { Response } from 'express';

@Injectable()
export class EmployeeService {
  constructor() {}

  public async list(
    query?: QueryEmployeeDTO,
  ): Promise<EmployeeWithPaginationResponse> {
    const params = { order: '^name', limit: 10, ...query };
    const qb = new QueryBuilder(Employee, 'emp', params);

    qb.fieldResolverMap['nik__icontains'] = 'emp.nik';
    qb.fieldResolverMap['name__icontains'] = 'emp.name';
    qb.fieldResolverMap['employeeStatus'] = 'emp.employee_status';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['emp.id', 'id'],
      ['emp.employee_id', 'employeeId'],
      ['emp.nik', 'nik'],
      ['emp.name', 'name'],
      ['emp.employee_role_id', 'positionId'],
      ['emp_role.employee_role_name', 'positionName'],
      ['emp.branch_id', 'branchId'],
      ['brc.branch_name', 'branchName'],
      ['emp.date_of_entry', 'dateOfEntry'],
      ['emp.date_of_resign', 'dateOfResign'],
      ['emp.is_deleted', 'isDeleted'],
    );
    qb.leftJoin((e) => e.employeeRole, 'emp_role');
    qb.leftJoin((e) => e.branch, 'brc');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const emp = await qb.exec();
    return new EmployeeWithPaginationResponse(emp, params);
  }

  public async excel(res: Response, query: QueryEmployeeDTO): Promise<Buffer> {
    try {
      const { write, utils } = XLSX;
      const params = { order: '^name', ...query };
      const qb = new QueryBuilder(Employee, 'emp', params);

      qb.fieldResolverMap['nik__icontains'] = 'emp.nik';
      qb.fieldResolverMap['name__icontains'] = 'emp.name';
      qb.fieldResolverMap['employeeStatus'] = 'emp.employee_status';

      qb.applyFilterQueries();
      qb.selectRaw(
        ['emp.id', 'id'],
        ['emp.employee_id', 'employeeId'],
        ['emp.nik', 'nik'],
        ['emp.name', 'name'],
        ['emp.employee_role_id', 'positionId'],
        ['emp_role.employee_role_name', 'positionName'],
        ['emp.branch_id', 'branchId'],
        ['brc.branch_name', 'branchName'],
        ['emp.date_of_entry', 'dateOfEntry'],
        ['emp.date_of_resign', 'dateOfResign'],
        ['emp.is_deleted', 'isDeleted'],
      );
      qb.leftJoin((e) => e.employeeRole, 'emp_role');
      qb.leftJoin((e) => e.branch, 'brc');
      qb.andWhere(
        (e) => e.isDeleted,
        (v) => v.isFalse(),
      );
      console.log(qb.getQuery());

      const emp = await qb.exec();
      const heading = [
        ['PT. SiCepat Express Indonesia'],
        ['Data Employee PT. Sicepat Express Indonesia'],
        [],
        ['NIK', 'Nama', 'Posisi', 'Cabang', 'Tanggal Masuk', 'Tanggal Keluar'],
      ];

      const dtSheet = emp.map((emp) => {
        return {
          nik: emp.nik,
          name: emp.name,
          positionName: emp.positionName,
          branchName: emp.branchName,
          dateOfEntry: emp.dateOfEntry,
          dateOfResign: emp.dateOfResign,
        };
      });

      const wb = utils.book_new();
      const ws = utils.aoa_to_sheet(heading);

      dtSheet['!autofilter'] = { ref: 'B4' };
      utils.sheet_add_json(ws, dtSheet, { origin: 4, skipHeader: true });
      utils.book_append_sheet(wb, ws, 'Report Employee');

      let buff = write(wb, { type: 'buffer' });

      const fileName = `employee-report-${new Date()}.xlsx`;

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
