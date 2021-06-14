import { AttachmentTypeDTO, CreateAttachmentTypeDTO, QueryAttachmentTypeDTO } from './../../domain/attachment-type/att-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { AttachmentType } from '../../../model/attachment-type.entity';
import { Repository } from 'typeorm';
import { AttachmentTypeResponse } from '../../domain/attachment-type/att-type.response';
import { AuthService } from './auth.service';
import { QueryBuilder } from 'typeorm-query-builder-wrapper/query-builder';

@Injectable()
export class AttachmentTypeService {

  constructor(
    @InjectRepository(AttachmentType)
    private readonly attTypeRepo: Repository<AttachmentType>,
  ) {}

  private static async getUserId() {
    const user = await AuthService.getUser();
    return user.id;
  }
  
  async get(query?: QueryAttachmentTypeDTO): Promise<any> {
    const params = { ...query };
    const qb = new QueryBuilder(AttachmentType, 'att', params);

    qb.fieldResolverMap['type'] = 'att.type';

    qb.applyFilterPagination();
    qb.selectRaw(
      ['att.id', 'id'],
      ['att.code', 'code'],
      ['att.name', 'name'],
      ['att.type', 'type']
    );

    const attType = await qb.exec();
    return attType
  }
  //   const getAll = await this.attTypeRepo.find({
  //     where: {
  //       isActive: true,
  //       isDeleted: false,
  //       type: type
  //     }
  //   })

  //   if (!getAll) {
  //     throw new HttpException('No data available', HttpStatus.NO_CONTENT)
  //   }

  //   return new HttpException(getAll, HttpStatus.OK);
  // }

  async find(id: string): Promise<AttachmentTypeResponse> {
    const checkId = await this.attTypeRepo.findOne({
      where: {
        id,
        isActive: true,
        isDeleted: false
      }
    })

    if (!checkId) {
      throw new HttpException('No data available', HttpStatus.NO_CONTENT)
    }

    return new AttachmentTypeResponse();
  }

  async create(payload: CreateAttachmentTypeDTO): Promise<AttachmentTypeResponse> {
    const checkName = await this.attTypeRepo.findOne({
      where: {
        isDeleted: false,
        isActive: true,
        name: payload.name
      }
    })

    if(checkName) {
      throw new HttpException('Nama telah digunakan.', HttpStatus.BAD_REQUEST)
    }

    const createAttType = await this.attTypeRepo.create(payload)
    createAttType.createUserId = await AttachmentTypeService.getUserId();
    createAttType.updateUserId = await AttachmentTypeService.getUserId();

    try {
      const attType = await this.attTypeRepo.save(createAttType)
      return new AttachmentTypeResponse(attType)
    } catch (error) {
      throw new Error(`Error : ${error.message}`);
    }
  }

  async update(id: string, payload: CreateAttachmentTypeDTO): Promise<AttachmentTypeResponse> {
    const checkId = await this.attTypeRepo.findOne({
      where: {
        id,
        isDeleted: false,
        isActive: true
      }
    })

    if (!checkId) {
      throw new HttpException('Id Tidak ditemukan', HttpStatus.BAD_REQUEST)
    }

    const updateAttType = await this.attTypeRepo.create(payload as AttachmentType)
    updateAttType.updateUserId = await AttachmentTypeService.getUserId();
    updateAttType.updatedAt = new Date();

    try {
      const attType = await this.attTypeRepo.update(id, updateAttType)
      return new AttachmentTypeResponse;
    } catch (error) {
      throw new Error(`Error : ${error.message}`);
    }
  }

  public async delete(id: string): Promise<any> {
    const attExist = await this.attTypeRepo.findOne({ id, isDeleted: false });
    if (!attExist) {
      throw new NotFoundException();
    }

    // SoftDelete
    const attType = await this.attTypeRepo.update(id, { updatedAt: new Date(), isDeleted: true });
    if (!attType) {
      throw new BadRequestException();
    }

    return new AttachmentTypeResponse();
  }

}