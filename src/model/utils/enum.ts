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

export enum AccountStatementAmountPosition {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum PartnerState {
  DRAFT = 'draft',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum PartnerType {
  PERSONAL = 'personal',
  COMPANY = 'company',
}

export enum VoucherState {
  DRAFT = 'draft',
  APPROVED = 'approved',
}

export enum AccountDownPaymentType {
  PERDIN = 'perdin',
  REIMBURSEMENT = 'reimbursement',
}

export enum AccountDownPaymentPayType {
  CASH = 'cash',
  BANK = 'bank',
}

export enum AccountDownPaymentState {
  DRAFT = 'draft',
  APPROVED_BY_SS = 'approved_by_ss',
  APPROVED_BY_SPV = 'approved_by_spv',
  REJECTED = 'rejected',
}

export enum AccountExpenseState {
  DRAFT = 'draft',
  APPROVED_BY_SS_SPV = 'approved_by_ss_spv_ho',
  APPROVED_BY_PIC = 'approved_by_pic_ho',
  REVERSED = 'reversed',
  REJECTED = 'rejected',
}

export enum AccountExpensePaymentType {
  CASH = 'cash',
  BANK = 'bank',
}

export enum AccountPaymentType {
  CASH = 'cash',
  BANK = 'bank',
}

export enum AccountPaymentPayMethod {
  PARTIALLY = 'partially',
  FULL = 'full',
}

export enum AccountLoanType {
  PAYABLE = 'payable',
  RECEIVABLE = 'receivable',
}

export enum AccountLoanPaymentType {
  CASH = 'cash',
  BANK = 'bank',
}

export enum AccountLoanState {
  PAID = 'paid',
  UNPAID = 'unpaid',
}

export enum AccountTaxPartnerType {
  PERSONAL = 'personal',
  COMPANY = 'company',
}

export enum JournalState {
  DRAFT = 'draft',
  APPROVED_BY_SS_HO = 'approved_by_ss_ho',
  APPROVED_BY_SPV_HO = 'approved_by_spv_ho',
  APPROVED_BY_TAX = 'approved_by_tax',
  POSTED = 'posted',
}

export enum JournalSourceType {
  DP = 'down_payment',
  // Add other type
}

export enum AccountFinancialReportType {
  SUM = 'sum',
  COA = 'coa',
  REPORT = 'report',
}

export enum AccountFinancialReportDisplayType {
  NO_DETAIL = 'no_detail',
  DETAIL_FLAT = 'detail_flat',
  DETAIL_WITH_HIERARCHY = 'detail_with_hierarchy',
}
