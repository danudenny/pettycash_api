import { Connection } from 'typeorm';
import { AccountCoa } from '../model/account-coa.entity';
import { Branch } from '../model/branch.entity';

const COA_ID_KAS_KANTOR_PUSAT = '36d2b72d-b1bb-4eed-8763-cd3378143353';
const COA_ID_KAS_MEDAN = '10520f57-45a1-4480-8ac5-662a8f468b7a';
const COA_ID_TAX2PERSEN = '01e5c4a4-e681-4608-b58b-a54a513f6a6b';

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

  const coaTax2Persen = new AccountCoa();
  coaTax2Persen.id = COA_ID_TAX2PERSEN;
  coaTax2Persen.code = '200.004.0010';
  coaTax2Persen.name = 'Tax 2%';
  coas.push(coaTax2Persen);

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

export { AssignCoaToBranch, AccountCoaSeed, COA_ID_TAX2PERSEN };
