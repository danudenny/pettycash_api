import { EmployeeVoucherItem } from '../../../model/employee-voucer-item.entity';
import { Employee } from '../../../model/employee.entity';
import { VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
import {
  BatchPayloadVoucherDTO,
  VoucherCreateDTO,
} from '../../domain/voucher/dto/voucher-create.dto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createQueryBuilder,
  EntityManager,
  getManager,
  In,
  Repository,
} from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Voucher } from '../../../model/voucher.entity';
import { QueryVoucherDTO } from '../../domain/voucher/voucher-query.payload';
import { VoucherDetailResponse } from '../../domain/voucher/response/voucher-detail.response.dto';
import { VoucherItem } from '../../../model/voucher-item.entity';
import { AuthService } from './auth.service';
import { GenerateCode } from '../../../common/services/generate-code.service';
import dayjs from 'dayjs';
import { Attachment } from '../../../model/attachment.entity';
import { AttachmentService } from '../../../common/services/attachment.service';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { VoucherAttachmentResponse } from '../../domain/voucher/response/voucer-attachment.response.dto';
import { VoucherAttachmentDTO } from '../../domain/voucher/dto/voucher-attachment.dto';
import axios from 'axios';
import { VoucherState } from '../../../model/utils/enum';
import { LoaderEnv } from '../../../config/loader';
import { AwsS3Service } from '../../../common/services/aws-s3.service';
import { QueryVoucherEmployeeDTO } from '../../domain/employee/employee.payload.dto';
import { EmployeeWithPaginationResponse } from '../../domain/employee/employee-response.dto';
import { EmployeeProductResponse } from '../../domain/employee/employee-product-response.dto';
import { PinoLogger } from 'nestjs-pino';

const logger = new PinoLogger({});

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
  ) {}

  private static get headerWebhook() {
    return {
      'API-Key': LoaderEnv.envs.VOUCHER_HELPER_KEY,
      'Content-Type': 'application/json',
    };
  }

  private static async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
  }

  private static async uploadAndRetrieveFiles(
    voucherId: string,
    manager: EntityManager,
    files?: any,
    attachmentType?: any,
  ): Promise<Attachment[]> {
    let newAttachments: Attachment[] = [];

    if (files && files.length) {
      const voucherPath = `voucher/${voucherId}`;
      newAttachments = await AttachmentService.uploadFiles(
        files,
        (file) => {
          const rid = randomStringGenerator().split('-')[0];
          return `${voucherPath}_${rid}_${file.originalname}`;
        },
        attachmentType,
        manager,
      );
    }

    return newAttachments;
  }

  private static async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUserBranches();
    } else {
      return await AuthService.getUser();
    }
  }

  public async getEmployee(
    query?: QueryVoucherEmployeeDTO,
  ): Promise<EmployeeWithPaginationResponse> {
    const params = { order: '^name', limit: 10, ...query };
    const qb = new QueryBuilder(Employee, 'emp', params);

    qb.fieldResolverMap['nik__icontains'] = 'emp.nik';
    qb.fieldResolverMap['name__icontains'] = 'emp.name';

    qb.applyFilterPagination();
    qb.selectRaw(['emp.id', 'id'], ['emp.nik', 'nik'], ['emp.name', 'name']);
    qb.andWhere(
      (e) => e.isHasVoucher,
      (v) => v.isTrue(),
    );
    qb.andWhere(
      (e) => e.employeeStatus,
      (v) => v.isTrue(),
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const emp = await qb.exec();
    return new EmployeeWithPaginationResponse(emp, params);
  }

  public async getProductByEmployeeId(
    id: string,
  ): Promise<EmployeeProductResponse> {
    const getProduct = await EmployeeVoucherItem.find({
      where: {
        employeeId: id,
      },
      relations: ['product'],
    });

    return new EmployeeProductResponse(getProduct);
  }

  public async list(
    query?: QueryVoucherDTO,
  ): Promise<VoucherWithPaginationResponse> {
    const countVoucher = await this.voucherRepo.count();
    const params = {
      order: '^created_at',
      limit: 10,
      total: countVoucher,
      ...query,
    };
    const qb = new QueryBuilder(Voucher, 'vcr', params);
    const { userBranchIds, isSuperUser } =
      await AuthService.getUserBranchAndRole();

    qb.fieldResolverMap['number__icontains'] = 'vcr.number';
    qb.fieldResolverMap['startDate__gte'] = 'vcr.transactionDate';
    qb.fieldResolverMap['endDate__lte'] = 'vcr.transactionDate';
    qb.fieldResolverMap['branchId'] = 'vcr.branchId';
    qb.fieldResolverMap['employeeId'] = 'vcr.employeeId';
    qb.fieldResolverMap['state'] = 'vcr.state';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['vcr.id', 'id'],
      ['vcr.transaction_date', 'transactionDate'],
      ['brc.branch_name', 'branchName'],
      ['emp.nik', 'employeeNik'],
      ['emp.name', 'employeeName'],
      ['emp_role.employeePosition', 'employeePosition'],
      ['vcr.number', 'number'],
      ['vcr.checkin_time', 'checkinTime'],
      ['vcr.checkout_time', 'checkoutTime'],
      ['vcr.total_amount', 'totalAmount'],
      ['vcr.is_realized', 'isRealized'],
      ['vcr.state', 'state'],
    );
    qb.leftJoin((e) => e.branch, 'brc');
    qb.leftJoin((e) => e.employee, 'emp');
    qb.leftJoin((e) => e.employee.employeeRole, 'emp_role');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    if (userBranchIds?.length && !isSuperUser) {
      qb.andWhere(
        (e) => e.branchId,
        (v) => v.in(userBranchIds),
      );
    }
    const vouchers = await qb.exec();
    return new VoucherWithPaginationResponse(vouchers, params);
  }

  public async getById(id: string): Promise<VoucherDetailResponse> {
    const { userBranchIds, isSuperUser } =
      await AuthService.getUserBranchAndRole();
    const where = { id, isDeleted: false };
    if (!isSuperUser) {
      Object.assign(where, { branchId: In(userBranchIds) });
    }

    const voucher = await this.voucherRepo.findOne({
      where,
      relations: [
        'branch',
        'employee',
        'employee.employeeRole',
        'items',
        'items.products',
      ],
    });

    if (!voucher) {
      throw new NotFoundException(`Voucher ID ${id} tidak ditemukan!`);
    }
    return new VoucherDetailResponse(voucher);
  }

  public async create(payload: VoucherCreateDTO): Promise<any> {
    try {
      const createVoucher = await getManager().transaction(async (manager) => {
        if (payload && !payload.number) {
          payload.number = GenerateCode.voucherManual();
        }

        if (!payload?.employeeId) {
          throw new BadRequestException(`'Employee ID Harus Diisi!`);
        }

        const checkEmployee = await this.voucherRepo.findOne({
          where: {
            employeeId: payload.employeeId,
            transactionDate: dayjs(new Date()).format('YYYY-MM-DD'),
            isDeleted: false,
          },
        });

        if (checkEmployee) {
          throw new BadRequestException(
            `'Employee Hanya diperbolehkan melakukan transaksi 1 kali / hari.`,
          );
        }

        // Build Voucher Item
        const items: VoucherItem[] = [];
        for (const v of payload.items) {
          const item = new VoucherItem();
          item.productId = v.productId;
          item.amount = v.amount;
          item.createUserId = await VoucherService.getUserId();
          item.updateUserId = await VoucherService.getUserId();
          items.push(item);
        }

        const user = await VoucherService.getUser(true);
        const branchId = user && user.branches && user.branches[0].id;
        const employeeId: string = payload.employeeId;
        const brcCoaExist = await createQueryBuilder('employee', 'emp')
          .select('brc.cash_coa_id')
          .leftJoin('branch', 'brc', 'emp.branch_id = brc.branch_id')
          .where(`emp.id = '${employeeId}'`)
          .andWhere('emp.isDeleted = false')
          .andWhere('brc.cash_coa_id IsNull')
          .getCount();

        if (brcCoaExist == 1) {
          throw new HttpException(
            'Cash Coa tidak ditemukan',
            HttpStatus.BAD_REQUEST,
          );
        }

        const checkBranchBalance = await createQueryBuilder('balance', 'blc')
          .select('blc.*')
          .leftJoin('voucher', 'vcr', 'blc.branch_id = vcr.branch_id')
          .where(`blc.branch_id = '${branchId}'`)
          .groupBy('blc.branch_id')
          .getRawOne();

        if (
          (payload.payment_type == 'cash' &&
            payload.totalAmount > checkBranchBalance.cash_amount) ||
          (payload.payment_type == 'bank' &&
            payload.totalAmount > checkBranchBalance.bank_amount)
        ) {
          throw new HttpException(
            'Saldo cabang tidak cukup',
            HttpStatus.BAD_REQUEST,
          );
        }

        // Build VOucher
        const voucher = new Voucher();
        voucher.branchId = branchId;
        voucher.number = payload.number;
        voucher.checkinTime = payload.checkinTime;
        voucher.checkoutTime = payload.checkinTime;
        voucher.transactionDate = new Date();
        voucher.employeeId = payload?.employeeId;
        voucher.items = items;
        voucher.totalAmount = payload?.totalAmount;
        voucher.paymentType = payload.payment_type;
        voucher.state = VoucherState.APPROVED;
        voucher.createUserId = await VoucherService.getUserId();
        voucher.updateUserId = await VoucherService.getUserId();

        return await manager.save(voucher);
      });

      const data = JSON.stringify({
        voucher_ids: [createVoucher.id],
        payment_type: createVoucher.paymentType,
      });
      const options = {
        headers: VoucherService.headerWebhook,
      };

      try {
        return await axios.post(
          LoaderEnv.envs.VOUCHER_HELPER_URL,
          data,
          options,
        );
      } catch (error) {
        console.log(error);
        const checkId = await this.voucherRepo.findByIds([createVoucher.id]);
        console.log(checkId);
        if (checkId) {
          await this.voucherRepo.delete({ id: createVoucher.id });
        }
        throw error;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async createAttachment(
    voucherId: string,
    files?: any,
  ): Promise<VoucherAttachmentResponse> {
    try {
      const createAttachment = await getManager().transaction(
        async (manager) => {
          const voucher = await manager.findOne(Voucher, {
            where: { id: voucherId, isDeleted: false },
            relations: ['attachments'],
          });

          if (!voucher || voucherId == undefined) {
            throw new NotFoundException(`Voucher ID:  ${voucherId} not found!`);
          }

          const existingAttachments = voucher.attachments;
          const newAttachments: Attachment[] =
            await VoucherService.uploadAndRetrieveFiles(
              voucherId,
              manager,
              files,
            );

          logger.info(newAttachments);

          voucher.attachments = [].concat(existingAttachments, newAttachments);
          voucher.updateUser = await AuthService.getUser();

          await manager.save(voucher);
          await manager.connection?.queryResultCache?.remove([
            `voucher:${voucherId}:attachments`,
          ]);

          return newAttachments;
        },
      );

      return new VoucherAttachmentResponse(
        createAttachment as VoucherAttachmentDTO[],
      );
    } catch (error) {
      throw error;
    }
  }

  public async listAttachment(
    voucherId: string,
  ): Promise<VoucherAttachmentResponse> {
    const qb = new QueryBuilder(Voucher, 'vcr', {});

    qb.selectRaw(
      ['vcr.id', 'voucherId'],
      ['att.id', 'id'],
      ['att."name"', 'name'],
      ['att.filename', 'fileName'],
      ['att.file_mime', 'fileMime'],
      ['att.url', 'url'],
      ['att.s3_acl', 'S3ACL'],
      ['att."path"', 'S3Key'],
      ['att.bucket_name', 'S3BucketName'],
      ['att.type_id', 'typeId'],
      ['typ.code', 'typeCode'],
      ['typ."name"', 'typeName'],
      ['att.is_checked', 'isChecked'],
    );
    qb.qb.innerJoin(`voucher_attachment`, 'va', 'va.voucher_id = vcr.id');
    qb.qb.innerJoin(
      `attachment`,
      'att',
      'att.id = va.attachment_id AND att.is_deleted IS FALSE',
    );
    qb.qb.leftJoin(
      `attachment_type`,
      'typ',
      'typ.id = att.type_id AND typ.is_active IS TRUE AND typ.is_deleted IS FALSE',
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.andWhere(
      (e) => e.id,
      (v) => v.equals(voucherId),
    );
    qb.qb.orderBy('att.updated_at', 'DESC');

    const { CACHE_ATTACHMENT_DURATION_IN_MINUTES } = LoaderEnv.envs;
    const cacheDuration = (CACHE_ATTACHMENT_DURATION_IN_MINUTES || 5) * 60; // in seconds

    qb.qb.cache(`voucher:${voucherId}:attachments`, 1000 * (cacheDuration - 5));
    const attachments = await qb.exec();
    if (!attachments) {
      throw new NotFoundException(`Attachments not found!`);
    }

    const signedAttachments = [];
    for (const att of attachments) {
      if (att.S3ACL === 'private') {
        att.url = await AwsS3Service.getSignedUrl(
          att.S3BucketName,
          att.S3Key,
          cacheDuration,
        );
      }
      delete att.S3ACL;
      delete att.S3Key;
      delete att.S3BucketName;
      signedAttachments.push(att);
    }

    return new VoucherAttachmentResponse(signedAttachments);
  }

  public async deleteAttachment(
    voucherId: string,
    attachmentId: string,
  ): Promise<void> {
    const attExist = await createQueryBuilder('attachment', 'att')
      .leftJoin('voucher_attachment', 'vat', 'att.id = vat.attachment_id')
      .where('vat.voucher_id = :voucherId', { voucherId })
      .andWhere('vat.attachment_id = :attachmentId', { attachmentId })
      .andWhere('att.isDeleted = false')
      .getOne();

    if (!attExist) {
      throw new NotFoundException('Tidak ditemukan attachment!');
    }
    // SoftDelete
    const deleteAttachment = await this.attachmentRepo.update(attachmentId, {
      isDeleted: true,
    });
    if (!deleteAttachment) {
      throw new BadRequestException('Failed to delete attachment!');
    }

    await getManager().connection?.queryResultCache?.remove([
      `voucher:${voucherId}:attachments`,
    ]);
  }

  public async redeem(data: BatchPayloadVoucherDTO): Promise<any> {
    const user = await AuthService.getUserRole();

    const voucherToUpdateIds: string[] = [];
    const vouchers = await this.voucherRepo.find({
      where: {
        id: In(data.voucher_ids),
        isDeleted: false,
      },
    });

    const paymentTypeFromQuery = [];

    for (const voucher of vouchers) {
      paymentTypeFromQuery.push(voucher.paymentType);
      voucherToUpdateIds.push(voucher.id);
    }

    await this.voucherRepo.update(
      { id: In(data.voucher_ids) },
      { paymentType: data.payment_type, updateUser: user },
    );

    const successIds = voucherToUpdateIds?.map((id) => {
      return id;
    });

    const options = {
      headers: VoucherService.headerWebhook,
    };

    const webhookResp = [];
    try {
      const response = await axios.post(
        LoaderEnv.envs.VOUCHER_HELPER_URL,
        JSON.stringify(data),
        options,
      );
      if (response) {
        webhookResp.push(response.data);
        const resp = [];
        for (const res of webhookResp[0]) {
          resp.push(res);
          if (
            res['status'] == 'VOUCHER_NOT_FOUND' ||
            res['status'] == 'BALANCE_NOT_ENOUGH'
          ) {
            await this.voucherRepo.update(
              { id: res['voucher_id'] },
              { paymentType: paymentTypeFromQuery[0] },
            );
          }
          if (
            res['status'] == 'GENERATE_JOURNAL_FAILED' ||
            res['status'] == 'EXPENSE_ALREADY_CREATE' ||
            res['status'] == 'SUCCESS'
          ) {
            await this.voucherRepo.update(
              { id: res['voucher_id'] },
              { paymentType: data.payment_type },
            );
          }
        }
      }
    } catch (error) {
      console.log('error: ' + error);
      await this.voucherRepo.update(
        { id: In(successIds) },
        { paymentType: paymentTypeFromQuery[0] },
      );
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const webHookResult = webhookResp[0];

    const ids = [];
    const statuses = [];
    webHookResult.forEach((element) => {
      ids.push(element.voucher_id);
      statuses.push(element.status);
    });

    const getVoucherNumber = await this.voucherRepo.find({
      where: {
        id: In(ids),
      },
    });

    const numbersVcr = [];

    if (getVoucherNumber.length == 0) {
      numbersVcr.push({
        number: '-',
        status: webHookResult[0].status,
      });
    }
    for (let i = 0; i < getVoucherNumber.length; i++) {
      if (!getVoucherNumber) {
        numbersVcr.push({
          number: '-',
          status: webHookResult[i].status,
        });
      }
      numbersVcr.push({
        number: getVoucherNumber[i].number,
        status: webHookResult[i].status,
      });
    }

    return numbersVcr;
  }
}
