import { VoucherResponse } from './../../domain/voucher/response/voucher.response.dto';
import {
  BatchPayloadVoucherDTO,
  VoucherCreateDTO,
} from './../../domain/voucher/dto/voucher-create.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  In,
  Repository,
  getManager,
  EntityManager,
  createQueryBuilder,
} from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { Voucher } from '../../../model/voucher.entity';
import { VoucherWithPaginationResponse } from '../../domain/voucher/response/voucher.response.dto';
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

@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
  ) {}

  private static async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
  }

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUser({ relations: ['branches'] });
    } else {
      return await AuthService.getUser();
    }
  }

  private static get headerWebhook() {
    return {
      'API-Key': LoaderEnv.envs.VOUCHER_HELPER_KEY,
      'Content-Type': 'application/json',
      Connection: 'keep-alive',
    };
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
          const pathId = `${voucherPath}_${rid}_${file.originalname}`;

          return pathId;
        },
        attachmentType,
        manager,
      );
    }

    return newAttachments;
  }

  public async list(
    query?: QueryVoucherDTO,
  ): Promise<VoucherWithPaginationResponse> {
    const params = { order: '^created_at', limit: 10, ...query };
    const qb = new QueryBuilder(Voucher, 'vcr', params);
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();

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
    const {
      userBranchIds,
      isSuperUser,
    } = await AuthService.getUserBranchAndRole();
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

    console.log(voucher);
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

        const user = await this.getUser(true);
        const branchId = user && user.branches && user.branches[0].id;
        const employeeId: string = payload.employeeId;
        const brcCoaExist = await createQueryBuilder('employee', 'emp')
          .select('brc.cash_coa_id')
          .leftJoin('branch', 'brc', 'emp.branch_id = brc.branch_id')
          .where(`emp.id = '${employeeId}'`)
          .andWhere('emp.isDeleted = false')
          .getCount();

        if (brcCoaExist == 0) {
          throw new HttpException(
            'Cash Coa tidak ditemukan',
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
        voucher.paymentType = payload.paymentType;
        voucher.state = VoucherState.APPROVED;
        voucher.createUserId = await VoucherService.getUserId();
        voucher.updateUserId = await VoucherService.getUserId();

        const result = await manager.save(voucher);
        return result;
      });

      const resultVoucher = new VoucherResponse(createVoucher);
      const data = JSON.stringify({
        voucher_ids: [resultVoucher.data['id']],
        payment_type: resultVoucher.data['paymentType'],
      });
      const options = {
        headers: VoucherService.headerWebhook,
      };

      try {
        await axios.post(LoaderEnv.envs.VOUCHER_HELPER_URL, data, options);
      } catch (error) {
        const checkId = await this.voucherRepo.findByIds(
          resultVoucher.data['id'],
        );
        if (checkId) {
          await this.voucherRepo.delete({ id: resultVoucher.data['id'] });
        }
        throw new HttpException(
          'Gagal Menyambungkan ke Webhook',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }

      return resultVoucher;
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

          if (!voucher) {
            throw new NotFoundException(`Voucher ID:  ${voucherId} not found!`);
          }

          const existingAttachments = voucher.attachments;
          const newAttachments: Attachment[] = await VoucherService.uploadAndRetrieveFiles(
            voucherId,
            manager,
            files,
          );

          voucher.attachments = [].concat(existingAttachments, newAttachments);
          voucher.updateUser = await AuthService.getUser();

          await manager.save(voucher);

          return newAttachments;
        },
      );

      return new VoucherAttachmentResponse(
        createAttachment as VoucherAttachmentDTO[],
      );
    } catch (error) {
      throw new BadRequestException(error);
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

    // TODO: add caching.

    const attachments = await qb.exec();
    if (!attachments) {
      throw new NotFoundException(`Attachments not found!`);
    }

    return new VoucherAttachmentResponse(attachments);
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
  }

  public async redeem(data: BatchPayloadVoucherDTO): Promise<any> {
    const user = await AuthService.getUser({ relations: ['role'] });

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
    const resultRedeem = {
      voucher_ids: successIds,
      payment_type: data.payment_type,
    };

    const dataJson = JSON.stringify(data);

    const options = {
      headers: VoucherService.headerWebhook,
    };

    const webhookResp = [];
    let statusResp = [];

    try {
      await axios
        .post(
          'http://pettycashstaging.sicepat.com:8889/webhook/pettycash/manual-voucher',
          dataJson,
          options,
        )
        .then((result) => {
          webhookResp.push(result.data);
          const resp = [];
          webhookResp[0].forEach(async (res) => {
            resp.push(res);
            if (
              res['status'] == 'FAILED' ||
              res['status'] == 'EXPENSE_ALREADY_CREATED' ||
              res['status'] == 'VOUCHER_NOT_FOUND'
            ) {
              await this.voucherRepo.update(
                { id: res['voucher_id'] },
                { paymentType: paymentTypeFromQuery[0] },
              );
            }
            if (res['status'] == 'APPROVING_EXPENSE_FAILED') {
              await this.voucherRepo.update(
                { id: res['voucher_id'] },
                { paymentType: data.payment_type },
              );
            }
          });
        });
    } catch (error) {
      await this.voucherRepo.update(
        { id: In(successIds) },
        { paymentType: paymentTypeFromQuery[0] },
      );
    }
    const webHookResult = webhookResp[0];
    if (webHookResult[0].status == 'FAILED') {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'FAILED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (webHookResult[0].status == 'EXPENSE_ALREADY_CREATED') {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'EXPENSE_ALREADY_CREATED',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (webHookResult[0].status == 'VOUCHER_NOT_FOUND') {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'VOUCHER_NOT_FOUND',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (webHookResult[0].status == 'APPROVING_EXPENSE_FAILED') {
      throw new HttpException(
        {
          status: HttpStatus.PARTIAL_CONTENT,
          message: 'APPROVING_EXPENSE_FAILED / FAILED_CREATE_JOURNAL',
        },
        HttpStatus.PARTIAL_CONTENT,
      );
    }
    if (webHookResult[0].status == 'SUCCESS') {
      throw new HttpException(
        { status: HttpStatus.OK, message: webHookResult[0] },
        HttpStatus.OK,
      );
    }
  }
}
function getConnection() {
  throw new Error('Function not implemented.');
}
