import { AttachmentType } from '../model/attachment-type.entity';
import { AttachmentTypes } from '../model/utils/enum';

const getAttachmentTypes = () => {
  let types: AttachmentType[] = [];
  const { PARTNER, EXPENSE } = AttachmentTypes;

  const t1 = new AttachmentType();
  t1.code = 'ktp';
  t1.name = 'KTP';
  t1.type = PARTNER;
  types.push(t1);

  const t2 = new AttachmentType();
  t2.code = 'npwp';
  t2.name = 'NPWP';
  t2.type = PARTNER;
  types.push(t2);

  const t3 = new AttachmentType();
  t3.code = 'siup';
  t3.name = 'SIUP';
  t3.type = PARTNER;
  types.push(t3);

  const t4 = new AttachmentType();
  t4.code = 'akta_pendirian';
  t4.name = 'Akta Pendirian';
  t4.type = PARTNER;
  types.push(t4);

  const t5 = new AttachmentType();
  t5.code = 'lain_lain';
  t5.name = 'Lainnya';
  t5.type = PARTNER;
  types.push(t5);

  const t6 = new AttachmentType();
  t6.code = 'approval';
  t6.name = 'Approval';
  t6.type = EXPENSE;
  types.push(t6);

  const t7 = new AttachmentType();
  t7.code = 'foto_pendukung';
  t7.name = 'Foto Pendukung';
  t7.type = EXPENSE;
  types.push(t7);

  const t8 = new AttachmentType();
  t8.code = 'manifest';
  t8.name = 'Manifest';
  t8.type = EXPENSE;
  types.push(t8);

  const t9 = new AttachmentType();
  t9.code = 'nota';
  t9.name = 'Nota / Invoice';
  t9.type = EXPENSE;
  types.push(t9);

  const t10 = new AttachmentType();
  t10.code = 'exp_lain_lain';
  t10.name = 'Lain lain';
  t10.type = EXPENSE;
  types.push(t10);

  // Add other attachmentType here.

  types = types.map((t) => {
    const temp = Object.assign({}, t);
    temp.createUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    temp.updateUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    return temp;
  });

  return types;
};

const AttachmentTypeSeed = getAttachmentTypes();

export default AttachmentTypeSeed;
