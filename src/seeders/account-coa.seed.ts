import { Connection } from 'typeorm';
import { AccountCoa } from '../model/account-coa.entity';
import { Branch } from '../model/branch.entity';

const COA_ID_KAS_KANTOR_PUSAT = '36d2b72d-b1bb-4eed-8763-cd3378143353';
const COA_ID_KAS_MEDAN = '10520f57-45a1-4480-8ac5-662a8f468b7a';
export const COA_ID_TAX2PERSEN = '01e5c4a4-e681-4608-b58b-a54a513f6a6b';
export const COA_ID_TAXPPH23 = '5470f0a1-7d58-4267-b4f0-ef1937833903';
export const COA_ID_TAXPPH21 = 'eaa5a57c-a044-4f59-91ae-010bbe6bd28d';
export const COA_ID_TAXPPH4A2 = 'd14ca044-5d1e-4ee2-9fba-6c84b295a27f';
export const COA_ID_JASA = '429fcd37-cc5c-41ea-a5f0-26e4c00dc03a';
export const COA_ID_SEWA_BANGUNAN = '785c3ed1-5a15-4c68-9fb0-f862594e3fa0';
export const COA_ID_SEWA_ALAT = 'a1f71689-17a6-4505-b202-c4131b401243';
export const COA_ID_BENSIN = '546ca89a-4f07-4821-8870-d276540187a8';

const getAccounts = () => {
  let coas: AccountCoa[] = [];

  const coa = new AccountCoa();
  coa.id = 'bc598bc8-aefd-44f1-92cf-2a3a0f1f2750';
  coa.code = '500.10.11';
  coa.name = 'Cash Transit Coa';
  coas.push(coa);

  const coa1 = new AccountCoa();
  coa1.id = 'e1bdd0d8-32f5-4d3e-99b5-c1a798b01766';
  coa1.code = '500.10.18';
  coa1.name = 'Cash Transit Coa Pengganti';
  coas.push(coa1);

  const coa2 = new AccountCoa();
  coa2.id = '03785a16-b0e9-4952-9667-9885ab24bba1';
  coa2.code = '500.20.22';
  coa2.name = 'Down Payment Perdin Coa';
  coas.push(coa2);

  const coa3 = new AccountCoa();
  coa3.id = 'b0e2733f-9387-41fe-a5a4-7444de0f0ffa';
  coa3.code = '500.20.24';
  coa3.name = 'Down Payment Perdin Coa Pengganti';
  coas.push(coa3);

  const coa4 = new AccountCoa();
  coa4.id = '8aa2325b-57f3-4626-b175-ae9e83729b79';
  coa4.code = '500.40.44';
  coa4.name = 'Down Payment Reimbursement Coa';
  coas.push(coa4);

  const coa5 = new AccountCoa();
  coa5.id = '3ab76b02-0489-4f65-981a-5ac91ad2b03b';
  coa5.code = '500.40.48';
  coa5.name = 'Down Payment Reimbursement Coa Pengganti';
  coas.push(coa5);

  const coa6 = new AccountCoa();
  coa6.id = COA_ID_JASA;
  coa6.code = '600.001.001X';
  coa6.name = 'Biaya Iklan Marketing';
  coas.push(coa6);

  const coa7 = new AccountCoa();
  coa7.id = COA_ID_SEWA_BANGUNAN;
  coa7.code = '116.002.001X';
  coa7.name = 'Biaya Sewa Ruko/Rumah Dibayar Dimuka';
  coas.push(coa7);

  const coa8 = new AccountCoa();
  coa8.id = COA_ID_SEWA_ALAT;
  coa8.code = '116.002.003X';
  coa8.name = 'Biaya Sewa Alat dan Kendaraan';
  coas.push(coa8);

  const coa9 = new AccountCoa();
  coa9.id = COA_ID_BENSIN;
  coa9.code = '500.001.002X';
  coa9.name = 'Biaya Bensin';
  coas.push(coa9);

  const coaCashKantorPusat = new AccountCoa();
  coaCashKantorPusat.id = COA_ID_KAS_KANTOR_PUSAT;
  coaCashKantorPusat.code = '111.001.0010';
  coaCashKantorPusat.name = 'Kas Kantor Pusat';
  coas.push(coaCashKantorPusat);

  const coaCashMedan = new AccountCoa();
  coaCashMedan.id = COA_ID_KAS_MEDAN;
  coaCashMedan.code = '111.001.3890';
  coaCashMedan.name = 'Kas Medan';
  coas.push(coaCashMedan);

  const coaPPH23 = new AccountCoa();
  coaPPH23.id = COA_ID_TAXPPH23;
  coaPPH23.code = '200.004.003X';
  coaPPH23.name = 'PPh Pasal 23 YMH Dibayar';
  coas.push(coaPPH23);

  const coaPPH21 = new AccountCoa();
  coaPPH21.id = COA_ID_TAXPPH21;
  coaPPH21.code = '200.004.002X';
  coaPPH21.name = 'PPh Pasal 21 YMH Dibayar';
  coas.push(coaPPH21);

  const coaPPH4A2 = new AccountCoa();
  coaPPH4A2.id = COA_ID_TAXPPH4A2;
  coaPPH4A2.code = '200.004.001X';
  coaPPH4A2.name = 'PPh Pasal 4(2) YMH Dibayar';
  coas.push(coaPPH4A2);

  coas = coas.map((mcoa) => {
    const temp = Object.assign({}, mcoa);
    temp.internalType = mcoa?.internalType ?? 'regular';
    temp.isActive = true;
    temp.userIdCreated = 15;
    temp.userIdUpdated = 15;
    temp.createdTime = new Date();
    temp.updatedTime = new Date();
    return temp;
  });

  return coas;
};

const AccountCoaSeed = getAccounts();

const AssignCoaToBranch = async (conn: Connection) => {
  const branchRepo = conn.getRepository(Branch);
  await branchRepo.update('142648ab-9624-4a7a-a4b4-2f1c51e648d7', {
    cashCoaId: COA_ID_KAS_KANTOR_PUSAT,
  });
  await branchRepo.update('28786cd1-bb9e-4926-a332-3a2e1c302e68', {
    cashCoaId: COA_ID_KAS_MEDAN,
  });
};

export { AssignCoaToBranch, AccountCoaSeed };
