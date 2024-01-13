import { AccountTax } from '../model/account-tax.entity';
import { AccountTaxGroup, AccountTaxPartnerType } from '../model/utils/enum';
import {
  COA_ID_TAXPPH21,
  COA_ID_TAXPPH23,
  COA_ID_TAXPPH4A2,
} from './account-coa.seed';

export const TAXID_PP23COMPANYNPWP = 'c5bdb862-a5f1-42c3-8983-b1a9affba488';
export const TAXID_PP23COMPANYNONNPWP = '99823f06-832b-48f3-a584-f1a77534943f';
export const TAXID_PP23PERSONALNPWP = 'ab2e56c4-4a4b-4785-85a4-dec85434d093';
export const TAXID_PP23PERSONALNONNPWP = '7a0a4a86-d255-499b-b658-91aabfc64977';
export const TAXID_PP21PERSONALNPWP = '10ba967f-e3d9-4e22-abc0-862adcd90371';
export const TAXID_PP21PERSONALNONNPWP = '25ffeb4d-23c1-47dd-9c7a-1d5488525aa0';
export const TAXID_PP4A2COMPANYNPWP = '5ca69b30-5f4b-4fab-965a-b278c0c4dc2f';
export const TAXID_PP4A2COMPANYNONNPWP = 'e22a25c0-50d8-4609-a60d-7de308c1759a';
export const TAXID_PP4A2PERSONALNPWP = 'c82feb47-b81c-459b-a5af-18c0b75b9b96';
export const TAXID_PP4A2PERSONALNONNPWP = '2a68369d-4307-4b9b-a065-348da24978f5';

const getTaxes = () => {
  let taxes: AccountTax[] = [];

  const t1 = new AccountTax();
  t1.id = TAXID_PP23COMPANYNPWP;
  t1.name = 'PPH 23 Perusahaan NPWP';
  t1.isHasNpwp = true;
  t1.taxInPercent = 2;
  t1.partnerType = AccountTaxPartnerType.COMPANY;
  t1.group = AccountTaxGroup.PPH23;
  t1.coaId = COA_ID_TAXPPH23;
  taxes.push(t1);

  const t2 = new AccountTax();
  t2.id = TAXID_PP23COMPANYNONNPWP;
  t2.name = 'PPH 23 Perusahaan Non NPWP';
  t2.isHasNpwp = false;
  t2.taxInPercent = 4;
  t2.partnerType = AccountTaxPartnerType.COMPANY;
  t2.group = AccountTaxGroup.PPH23;
  t2.coaId = COA_ID_TAXPPH23;
  taxes.push(t2);

  const t3 = new AccountTax();
  t3.id = TAXID_PP23PERSONALNPWP;
  t3.name = 'PPH 23 Perorangan NPWP';
  t3.isHasNpwp = true;
  t3.taxInPercent = 2;
  t3.partnerType = AccountTaxPartnerType.PERSONAL;
  t3.group = AccountTaxGroup.PPH23;
  t3.coaId = COA_ID_TAXPPH23;
  taxes.push(t3);

  const t4 = new AccountTax();
  t4.id = TAXID_PP23PERSONALNONNPWP;
  t4.name = 'PPH 23 Perorangan Non NPWP';
  t4.isHasNpwp = false;
  t4.taxInPercent = 4;
  t4.partnerType = AccountTaxPartnerType.PERSONAL;
  t4.group = AccountTaxGroup.PPH23;
  t4.coaId = COA_ID_TAXPPH23;
  taxes.push(t4);

  const t5 = new AccountTax();
  t5.id = TAXID_PP21PERSONALNPWP;
  t5.name = 'PPH 21 Perorangan NPWP';
  t5.isHasNpwp = true;
  t5.taxInPercent = 2.5;
  t5.partnerType = AccountTaxPartnerType.PERSONAL;
  t5.group = AccountTaxGroup.PPH21;
  t5.coaId = COA_ID_TAXPPH21;
  taxes.push(t5);

  const t6 = new AccountTax();
  t6.id = TAXID_PP21PERSONALNONNPWP;
  t6.name = 'PPH 21 Perorangan Non NPWP';
  t6.isHasNpwp = false;
  t6.taxInPercent = 3;
  t6.partnerType = AccountTaxPartnerType.PERSONAL;
  t6.group = AccountTaxGroup.PPH21;
  t6.coaId = COA_ID_TAXPPH21;
  taxes.push(t6);

  const t7 = new AccountTax();
  t7.id = TAXID_PP4A2COMPANYNPWP;
  t7.name = 'PPH 4(2)';
  t7.isHasNpwp = true;
  t7.taxInPercent = 10;
  t7.partnerType = AccountTaxPartnerType.COMPANY;
  t7.group = AccountTaxGroup.PPH4A2;
  t7.coaId = COA_ID_TAXPPH4A2;
  taxes.push(t7);

  const t8 = new AccountTax();
  t8.id = TAXID_PP4A2COMPANYNONNPWP;
  t8.name = 'PPH 4(2)';
  t8.isHasNpwp = false;
  t8.taxInPercent = 10;
  t8.partnerType = AccountTaxPartnerType.COMPANY;
  t8.group = AccountTaxGroup.PPH4A2;
  t8.coaId = COA_ID_TAXPPH4A2;
  taxes.push(t8);

  const t9 = new AccountTax();
  t9.id = TAXID_PP4A2PERSONALNPWP;
  t9.name = 'PPH 4(2)';
  t9.isHasNpwp = true;
  t9.taxInPercent = 10;
  t9.partnerType = AccountTaxPartnerType.PERSONAL;
  t9.group = AccountTaxGroup.PPH4A2;
  t9.coaId = COA_ID_TAXPPH4A2;
  taxes.push(t9);

  const t10 = new AccountTax();
  t10.id = TAXID_PP4A2PERSONALNONNPWP;
  t10.name = 'PPH 4(2)';
  t10.isHasNpwp = false;
  t10.taxInPercent = 10;
  t10.partnerType = AccountTaxPartnerType.PERSONAL;
  t10.group = AccountTaxGroup.PPH4A2;
  t10.coaId = COA_ID_TAXPPH4A2;
  taxes.push(t10);

  // Add other tax here.

  taxes = taxes.map((tax) => {
    const temp = Object.assign({}, tax);
    temp.createUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    temp.updateUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    return temp;
  });

  return taxes;
};

const AccountTaxSeed = getTaxes();

export { AccountTaxSeed };
