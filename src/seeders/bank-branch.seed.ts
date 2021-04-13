import { BankBranch } from '../model/bank-branch.entity';

const getBankBranches = () => {
  const bankBranches: BankBranch[] = [];

  const bb = new BankBranch();
  bb.bankBranchId = 10;
  bb.branchId = 10;
  bb.bankId = 1;
  bb.bankName = 'BCA';
  bb.accountNumber = '770990011';
  bb.accountHolderName = 'SiCepat Medan';
  bankBranches.push(bb);

  const b2 = new BankBranch();
  b2.bankBranchId = 11;
  b2.branchId = 10;
  b2.bankId = 2;
  b2.bankName = 'BNI';
  b2.accountNumber = '9009122001';
  b2.accountHolderName = 'SiCepat Medan BNI';
  bankBranches.push(b2);

  return bankBranches;
};

const BankBranchSeed = getBankBranches();

export default BankBranchSeed;
