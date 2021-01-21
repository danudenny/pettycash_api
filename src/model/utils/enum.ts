export enum PeriodState {
  OPEN = 'open',
  CLOSE = 'close',
}

export enum BudgetState {
  DRAFT = 'draft',
  APPROVED_BY_SS = 'approved_by_ss',
  APPROVED_BY_SPV = 'approved_by_spv',
  REJECTED = 'rejected',
}

export enum BudgetRequestState {
  DRAFT = 'draft',
  APPROVED_BY_OPS = 'approved_by_ops_ho',
  APPROVED_BY_PIC = 'approved_by_pic_ho',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export enum CashBalanceAllocationState {
  DRAFT = 'draft',
  APPROVED_BY_SS = 'approved_by_ss_ho',
  APPROVED_BY_SPV = 'approved_by_spv_ho',
  REJECTED = 'rejected',
  RECEIVED = 'received',
  TRANSFERRED = 'transferred',
  EXPIRED = 'close',
}

export enum AccountStatementType {
  CASH = 'cash',
  BANK = 'bank',
  // VA = 'virtual_account',
}

