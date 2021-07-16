import { VoucherResponse } from './../../domain/voucher/response/voucher.response.dto';
import { RedeemVoucherDTO, VoucherCreateDTO } from './../../domain/voucher/dto/voucher-create.dto';
import { BadRequestException, HttpService, Injectable, NotFoundException, HttpException, HttpStatus, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, getManager, EntityManager, createQueryBuilder } from 'typeorm';
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
import { randomStringGenerator, randomStringGenerator as uuid } from '@nestjs/common/utils/random-string-generator.util';
import { VoucherAttachmentResponse } from '../../domain/voucher/response/voucer-attachment.response.dto';
import { VoucherAttachmentDTO } from '../../domain/voucher/dto/voucher-attachment.dto';
import { Observable } from 'rxjs';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { MASTER_ROLES, VoucherState } from '../../../model/utils/enum';


@Injectable()
export class VoucherService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepo: Repository<Voucher>,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
    private httpService: HttpService
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
      'API-Key':"d73c76de-abe7-42cd-97e7-ef4fb33b323f",
      'Content-Type': 'application/json',
      'Connection': 'keep-alive',
    };
  }

  private static async uploadAndRetrieveFiles(
    voucherId: string,
    manager: EntityManager,
    files?: any,
    attachmentType?: any
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
      ['emp.position_name', 'employeePosition'],
      ['vcr.number', 'number'],
      ['vcr.checkin_time', 'checkinTime'],
      ['vcr.checkout_time', 'checkoutTime'],
      ['vcr.total_amount', 'totalAmount'],
      ['vcr.is_realized', 'isRealized'],
      ['vcr.state', 'state'],
    );
    qb.leftJoin((e) => e.branch, 'brc');
    qb.leftJoin((e) => e.employee, 'emp');
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
      relations: ['branch', 'employee', 'items', 'items.products'],
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

        if (!(payload?.employeeId)) {
          throw new BadRequestException(
            `'Employee ID Harus Diisi!`,
          );
        }

        const checkEmployee = await this.voucherRepo.findOne({
          where: {
            employeeId: payload.employeeId,
            transactionDate: dayjs(new Date).format('YYYY-MM-DD'),
            isDeleted: false
          }
        })
  
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
        return result
      });

      const resultVoucher = new VoucherResponse(createVoucher);
      const data = JSON.stringify({
        'voucher_id':resultVoucher.data['id']
      });
      const options = {
        headers: VoucherService.headerWebhook
      };

      try {
        await axios.post('http://pettycashstaging.sicepat.com:8889/webhook/pettycash/manual-voucher', data, options)
      } catch (error) {
        const checkId = await this.voucherRepo.findByIds(resultVoucher.data['id'])
        if (checkId) {
          await this.voucherRepo.delete({id: resultVoucher.data['id']})
        }
        throw new HttpException('Gagal Menyambungkan ke Webhook', HttpStatus.GATEWAY_TIMEOUT);
      }

      const resJson = {
        "voucher_ids": [
          resultVoucher.data['id']
        ],
        "payment_type": resultVoucher.data['paymentType']
      };
      
      return resJson
    } catch (err) {
      console.log(err)
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
          const voucher = await manager.findOne(
            Voucher,
            {
              where: { id: voucherId, isDeleted: false },
              relations: ['attachments'],
            },
          );

          if (!voucher) {
            throw new NotFoundException(
              `Voucher ID:  ${voucherId} not found!`,
            );
          }

          const existingAttachments = voucher.attachments;
          const newAttachments: Attachment[] = await VoucherService.uploadAndRetrieveFiles(
            voucherId,
            manager,
            files,
          );

          voucher.attachments = [].concat(
            existingAttachments,
            newAttachments,
          );
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

  public async redeem(ids: string[], data: RedeemVoucherDTO): Promise<{ success: object[]; fail: object[] }> {
    const { DRAFT, APPROVED } = VoucherState;

    let state: VoucherState;
    
    const voucherToUpdateIds: string[] = [];
    const failedIds: object[] = [];
    const vouchers = await this.voucherRepo.find({
      where: {
        id: In(ids),
        isDeleted: false,
      },
    });

    for (const voucher of vouchers) {
      if ([state, APPROVED].includes(voucher.state)) {
        failedIds.push({ id: voucher.id });
        continue;
      }
      voucherToUpdateIds.push(voucher.id);
    }

    if (!state) {
      throw new UnprocessableEntityException(
        `Gagal redeem voucher!`,
      );
    }

    const updatedVoucher = this.voucherRepo.create(data as Voucher);
    updatedVoucher.updatedAt = new Date();
    updatedVoucher.updateUserId = await VoucherService.getUserId();

    await this.voucherRepo.update(
      { id: In(voucherToUpdateIds) },updatedVoucher,
    );

    const successIds = voucherToUpdateIds?.map((id) => {
      return { id };
    });
    const result = { success: successIds, fail: failedIds };
    return result;
  }
}
