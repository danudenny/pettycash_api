import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryBuilder } from 'typeorm-query-builder-wrapper';
import { GenerateCode } from '../../../common/services/generate-code.service';
import { Partner } from '../../../model/partner.entity';
import { PartnerState } from '../../../model/utils/enum';
import { PG_UNIQUE_CONSTRAINT_VIOLATION } from '../../../shared/errors';
import { CreatePartnerDTO } from '../../domain/partner/create.dto';
import { QueryPartnerDTO } from '../../domain/partner/partner.payload.dto';
import {
  PartnerResponse,
  PartnerWithPaginationResponse,
} from '../../domain/partner/response.dto';
import { UpdatePartnerDTO } from '../../domain/partner/update.dto';
import { AuthService } from './auth.service';

export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
  ) {}

  private async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
  }

  async list(query: QueryPartnerDTO): Promise<PartnerResponse> {
    const params = { order: '-createdAt', limit: 25, ...query };
    const qb = new QueryBuilder(Partner, 'p', params);

    qb.fieldResolverMap['id'] = 'p.id';
    qb.fieldResolverMap['name__contains'] = 'p.name';
    qb.fieldResolverMap['code__contains'] = 'p.code';
    qb.fieldResolverMap['state'] = 'p.state';
    qb.fieldResolverMap['type'] = 'p."type"';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['p.id', 'id'],
      ['p.code', 'code'],
      ['p.name', 'name'],
      ['p.address', 'address'],
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
    partner.createUserId = await this.getUserId();
    partner.updateUserId = await this.getUserId();

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
    updatedPartner.updateUserId = await this.getUserId();

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
    return;
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
    partner.state = PartnerState.APPROVED;
    partner.updateUserId = await this.getUserId();

    const updatePartner = await this.partnerRepo.save(partner);
    if (!updatePartner) {
      throw new BadRequestException();
    }

    return new PartnerResponse(updatePartner as any);
  }
}
