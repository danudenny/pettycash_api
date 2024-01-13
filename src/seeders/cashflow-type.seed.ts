import { CashflowType } from '../model/cashflow-type.entity';
import { COA_ID_TRANSIT, COA_ID_TRANSIT2 } from './account-coa.seed';

const getCashFlowTypes = () => {
  let types: CashflowType[] = [];

  const t1 = new CashflowType();
  t1.name = 'Kas Masuk';
  t1.coaId = COA_ID_TRANSIT2;
  t1.isActive = true;
  types.push(t1);

  const t2 = new CashflowType();
  t2.name = 'Dana Transit Kas';
  t2.coaId = COA_ID_TRANSIT;
  t2.isActive = true;
  types.push(t2);

  types = types.map((t) => {
    const temp = Object.assign({}, t);
    temp.createUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    temp.updateUserId = '3aa3eac8-a62f-44c3-b53c-31372492f9a0';
    return temp;
  });

  return types;
};

export const CashFlowTypeSeed = getCashFlowTypes();
