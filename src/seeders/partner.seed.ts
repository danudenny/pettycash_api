import { Partner } from '../model/partner.entity';
import { PartnerState, PartnerType } from '../model/utils/enum';

const getPartners = () => {
  const partners: Partner[] = [];

  const hr = new Partner();
  hr.id = '84ada2dd-5750-479b-ae54-7edd81dfe35c';
  hr.name = 'HR Sicepat';
  hr.code = 'HR_SICEPAT';
  hr.createUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  hr.updateUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  partners.push(hr)

  const p1 = new Partner();
  p1.id = '9a8e1543-8bca-4ee3-9929-9648027b6055';
  p1.name = 'PT. Indah Sekali';
  p1.code = 'PRTN001';
  p1.type = PartnerType.COMPANY;
  p1.state = PartnerState.APPROVED;
  p1.npwpNumber = '1232.1231.999-12.11';
  p1.idCardNumber = '332211440920001';
  p1.createUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  p1.updateUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  partners.push(p1)

  const p2 = new Partner();
  p2.id = 'b80379a6-7f6b-4ef5-a9b2-f632489639c6';
  p2.name = 'PT. Anggun Kapuk (draft)';
  p2.code = 'PRTN002';
  p2.type = PartnerType.COMPANY;
  p2.state = PartnerState.DRAFT;
  p2.npwpNumber = '4232.1231.999-12.11';
  p2.idCardNumber = '772211440920001';
  p2.createUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  p2.updateUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
  partners.push(p2)

  return partners;
}

const PartnerSeed = getPartners();

export default PartnerSeed;
