import { AccountTax } from '../model/account-tax.entity';
import { AccountTaxPartnerType } from '../model/utils/enum';
import { COA_ID_TAX2PERSEN } from './account-coa.seed';

const getTaxes = () => {
  const taxes: AccountTax[] = [];

  const t1 = new AccountTax();
  t1.id = '8ebfc985-0ee9-4dfa-8c35-5d1e806ba2de';
  t1.name = 'Tax 2%';
  t1.taxInPercent = 2;
  t1.isHasNpwp = true;
  t1.partnerType = AccountTaxPartnerType.COMPANY;
  t1.coaId = COA_ID_TAX2PERSEN;
  t1.createUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  t1.updateUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  taxes.push(t1);

  // Add other tax here.

  return taxes;
};

const AccountTaxSeed = getTaxes();

export { AccountTaxSeed };
