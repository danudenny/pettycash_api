import { Expense } from '../../../model/expense.entity';
import { BadRequestException, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, getManager, Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { AttachmentService } from '../../../common/services/attachment.service';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { Attachment } from '../../../model/attachment.entity';
import { Partner } from '../../../model/partner.entity';
import { PartnerState } from '../../../model/utils/enum';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from '../../../shared/errors';
import { CreatePartnerDTO } from '../../domain/partner/create.dto';
import { PartnerAttachmentDTO } from '../../domain/partner/partner-attahcment.dto';
import { QueryPartnerDTO } from '../../domain/partner/partner.payload.dto';
import { PartnerAttachmentResponse } from '../../domain/partner/response-attachment.dto';
import { randomStringGenerator as uuid } from '@nestjs/common/utils/random-string-generator.util';
import { PartnerResponse, PartnerWithPaginationResponse } from '../../domain/partner/response.dto';
import { UpdatePartnerDTO } from '../../domain/partner/update.dto';
import { AuthService } from './auth.service';
import dayjs from 'dayjs';
import { AttachmentType } from '../../../model/attachment-type.entity';

export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
    @InjectRepository(Attachment)
    private readonly attachmentRepo: Repository<Attachment>,
    @InjectRepository(AttachmentType)
    private readonly attachmentTypeRepo: Repository<AttachmentType>,
  ) {}

  private async getUser(includeBranch: boolean = false) {
    if (includeBranch) {
      return await AuthService.getUser({ relations: ['branches'] });
    } else {
      return await AuthService.getUser();
    }
  }

  async list(query: QueryPartnerDTO): Promise<PartnerResponse> {
    const params = { order: '-createdAt', limit: 25, ...query };
    const qb = new QueryBuilder(Partner, 'p', params);

    qb.fieldResolverMap['id'] = 'p.id';
    qb.fieldResolverMap['name__icontains'] = 'p.name';
    qb.fieldResolverMap['code__icontains'] = 'p.code';
    qb.fieldResolverMap['state'] = 'p.state';
    qb.fieldResolverMap['type'] = 'p."type"';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['p.id', 'id'],
      ['p.code', 'code'],
      ['p.name', 'name'],
      ['p.address', 'address'],
      ['p.email', 'email'],
      ['p.mobile', 'mobile'],
      ['p.website', 'website'],
      ['p."type"', 'type'],
      ['p.npwp_number', 'npwpNumber'],
      ['p.id_card_number', 'idCardNumber'],
      ['p.state', 'state'],
      ['p.created_at', 'createdAt'],
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );

    const partners = await qb.exec();
    return new PartnerWithPaginationResponse(partners, params);
  }

  public async get(id: string): Promise<PartnerResponse> {
    const partner = await this.partnerRepo.findOne({
      where: { id, isDeleted: false },
      relations: ['attachments']
    });
    if (!partner) {
      throw new NotFoundException(`Partner ID ${id} not found!`);
    }

    return new PartnerResponse(partner as any);
  }

  public async create(payload: CreatePartnerDTO): Promise<PartnerResponse> {
    if (payload && !payload.code) {
      payload.code = GenerateCode.partner();
    }

    const existingPartner = await this.partnerRepo.find({
      select: ['id'],
      where: {
        name: payload.name,
        address: payload.address,
        isDeleted: false,
      },
    });

    if (!!existingPartner.length) {
      throw new BadRequestException(
        `Nama partner dengan alamat yang sama sudah pernah dibuat`,
      );
    }

    const partner = this.partnerRepo.create(payload as Partner);
    const responsiblePartner = await this.getUser();
    partner.createUserId = responsiblePartner.id;
    partner.updateUserId = responsiblePartner.id;
    partner.isActive = true;

    const newPartner = await this.partnerRepo.save(partner);
    return new PartnerResponse(newPartner);
  }

  public async update(id: string, payload: UpdatePartnerDTO) {
    const partner = await this.partnerRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!partner) {
      throw new NotFoundException(`Partner ID ${id} not found!`);
    }

    const updatedPartner = this.partnerRepo.create(payload as Partner);
    const responsiblePartner = await this.getUser();
    partner.updateUserId = responsiblePartner.id;

    try {
      await this.partnerRepo.update(id, updatedPartner);
    } catch (err) {
      if (err && err.code === PG_UNIQUE_CONSTRAINT_VIOLATION) {
        throw new BadRequestException(
          `Nama partner dengan alamat yang sama sudah pernah dibuat`,
        );
      }
      throw err;
    }
    return new HttpException('Sukses update Partner', HttpStatus.OK);
  }

  public async delete(id: string): Promise<any> {
    const partnerExist = await this.partnerRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!partnerExist) {
      throw new NotFoundException(`Partner ID ${id} not found!`);
    }

    const partner = await this.partnerRepo.update(id, { isDeleted: true });
    if (!partner) {
      throw new BadRequestException();
    }

    return;
  }

  public async approve(id: string): Promise<any> {
    const partnerExist = await this.partnerRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!partnerExist) {
      throw new NotFoundException(`Partner ID ${id} not found!`);
    }

    if (partnerExist.state === PartnerState.APPROVED) {
      throw new BadRequestException(
        `Partner ${partnerExist.name} already approved!`,
      );
    }

    const partner = this.partnerRepo.create(partnerExist);
    const responsiblePartner = await this.getUser();
    partner.state = PartnerState.APPROVED;
    partner.updateUserId = responsiblePartner.id;

    const updatePartner = await this.partnerRepo.save(partner);
    if (!updatePartner) {
      throw new BadRequestException();
    }

    return new PartnerResponse(updatePartner as any);
  }

  //  ! Attachment Section
  public async createAttachment(
    partnerId: string,
    files?: any,
    typeId?: any
  ): Promise<PartnerAttachmentResponse> {
    try {
      const createAttachment = await getManager().transaction(
        async (manager) => {
          const partner = await manager.findOne(Partner, {
            where: { id: partnerId, isDeleted: false },
            relations: ['attachments'],
          });
          
          if (!partner) {
            throw new NotFoundException(
              `Expense with ID ${partnerId} not found!`,
            );
          }
                    
          // Upload file attachments
          let newAttachments: Attachment[];
          let attType: AttachmentType;
          let pathId: string;
          if (files && files.length) {
            if (typeId) {
                attType = await manager.findOne(AttachmentType, {
                where: {
                  id: typeId,
                  isDeleted: false,
                  isActive: true,
                },
              });
            }

            // TODO: move out as utils
            const getExt = (file: any) => {
              return file?.originalname?.split('.').pop();
            };
            const parseAttTypeName = (attName: string) => {
              return attName
                ?.replace('/', '')
                .split(/\s+/)
                .join(' ')
                .replace(' ', '_')
                .toUpperCase();
            };

            const partnerPath = `partner/${partnerId}`;
            newAttachments = await AttachmentService.uploadFilesWithCustomName(
              files,
              (file) => {
                const rid = uuid().split('-')[1];
                let attachmentName: string;
                if (attType?.name) {
                  const attTypeName = parseAttTypeName(attType?.name);
                  const ext = getExt(file);
                  attachmentName = `${rid}_${attTypeName}.${ext}`;
                } else {
                  attachmentName = `${rid}_${file.originalname}`;
                }
                return attachmentName;
              },
              (file) => {
                if (attType?.name) {
                  const attTypeName = parseAttTypeName(attType?.name);
                  const ext = getExt(file);
                  pathId = `${partnerPath}_${attTypeName}.${ext}`;
                } else {
                  const rid = uuid().split('-')[0];
                  pathId = `${partnerPath}_${rid}_${file.originalname}`;
                }
                return pathId;
              },
              typeId,
              manager,
            );
          }

          const existingAttachments = partner.attachments;
          
          partner.attachments = [].concat(existingAttachments, newAttachments);
          partner.updateUser = await this.getUser();

          await manager.save(partner);
          return newAttachments;
        },
      );
      return new PartnerAttachmentResponse(
        createAttachment as PartnerAttachmentDTO[],
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  public async deleteAttachment(
    partnerId: string,
    attachmentId: string,
  ): Promise<void> {
    // TODO: Implement API Delete Partner Attachments
    const attExist = await createQueryBuilder('attachment', 'att')
      .leftJoin('partner_attachment', 'pa', 'att.id = pa.attachment_id')
      .where('pa.partner_id = :partnerId', { partnerId })
      .andWhere('pa.attachment_id = :attachmentId', { attachmentId })
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

    throw new HttpException('Berhasil menghapus attachment', HttpStatus.OK)
  }

  public async updatePartnerActive() {
    const qb = new QueryBuilder(Expense, 'exp');
    qb.selectRaw(
      ['prt.id', 'id'],
      ['prt.name', 'name'],
      ['exp.transaction_date', 'transactionDate'],
      ['prt.is_active', 'isActive'],
    );
    qb.leftJoin((e) => e.partner, 'prt');
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.andWhere(
      (e) => e.partner.isActive,
      (v) => v.isTrue(),
    );

    const getPartner = await qb.exec();

    const update = await this.partnerRepo.create({
      isActive: false,
      updatedAt: new Date()
    });

    getPartner.forEach(element => {
      const dateNow = dayjs(new Date());
      const trxDate = dayjs(element.transactionDate);
      const diffDate = dateNow.diff(trxDate, 'days')
      if (diffDate > 182.6) {
        let nonActPartner =  this.partnerRepo.update(element.id, update);
        return new HttpException(nonActPartner, HttpStatus.OK);
      }
        
    });
  }

  public async listAttachment(
    partnerId: string,
  ): Promise<PartnerAttachmentResponse> {
    const qb = new QueryBuilder(Partner, 'prt', {});

    qb.selectRaw(
      ['prt.id', 'partnerId'],
      ['att.id', 'id'],
      ['att."name"', 'name'],
      ['att.filename', 'fileName'],
      ['att.file_mime', 'fileMime'],
      ['att.url', 'url'],
    );
    qb.innerJoin(
      (e) => e.attachments,
      'att',
      (j) =>
        j.andWhere(
          (e) => e.isDeleted,
          (v) => v.isFalse(),
        ),
    );
    qb.andWhere(
      (e) => e.isDeleted,
      (v) => v.isFalse(),
    );
    qb.andWhere(
      (e) => e.id,
      (v) => v.equals(partnerId),
    );

    const attachments = await qb.exec();
    if (!attachments) {
      throw new NotFoundException(`Attachments not found!`);
    }

    return new PartnerAttachmentResponse(attachments);
  }

}

// TODO: if date > 6bulan