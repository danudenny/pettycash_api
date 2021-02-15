import { AccountCoa } from '../model/account-coa.entity';

const getAccounts = () => {
    const coas: AccountCoa[] = [];

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

    return coas;
}

const AccountCoaSeed = getAccounts();

export default AccountCoaSeed;