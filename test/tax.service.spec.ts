import { 
  TaxWithPaginationResponse,
  TaxResponse 
} from './../src/app/domain/tax/tax-response.dto';
import { AccountTax } from './../src/model/account-tax.entity';
import { TaxService } from './../src/app/services/master/v1/tax.service';
import { 
  Test,
  TestingModule
} from "@nestjs/testing";
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTaxDTO } from '../src/app/domain/tax/create-tax.dto';
import { UpdateTaxDTO } from '../src/app/domain/tax/update-tax.dto';
import { AccountTaxPartnerType } from '../src/model/utils/enum';

describe('ProductService', () => {
  let service: TaxService;

  const mockService = {
    findOne: jest.fn().mockImplementation(tax => Promise.resolve(tax.id)),
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(tax => Promise.resolve({...tax}))
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaxService, 
        {
          provide: getRepositoryToken(AccountTax),
          useValue: mockService
        }
      ],
    }).compile();

    service = module.get<TaxService>(TaxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all tax', async () => {
    const buildTax = new TaxWithPaginationResponse;
    const listTax = await service.list();
    buildTax.data = listTax.data
    buildTax.meta = listTax.meta
    jest.spyOn(service, 'list').mockResolvedValue(buildTax);
    expect(listTax).toEqual(buildTax);
  });

  describe('create tax service', () => {
    const dto = new CreateTaxDTO();

    it('should create a tax and return it', async () => {
      const expectedResult = new TaxResponse();
      jest.spyOn(service, "create").mockResolvedValue(expectedResult);
      expect(await service.create(dto)).toBe(expectedResult);
    })
  })

  describe('update tax service', () => {
    it('should be able to update a tax', async () => {
      const dto = new UpdateTaxDTO();
      const createTax = await service.create(
        {
          name: "Perusahaan NPWP",
          isHasNpwp: true,
          taxInPercent: 10,
          partnerType: AccountTaxPartnerType.PERSONAL,
          coaId: "b7726b7b-6882-42ea-b623-d8f8a347ba0b"
        }
      );
      const updatedTax = await service.update(createTax.data['id'], dto);
      expect(createTax).not.toBe(updatedTax);
    });
  })

  afterEach(() => {
    jest.resetAllMocks();
  });

})