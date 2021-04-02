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

export enum DownPaymentType {
  PERDIN = 'perdin',
  REIMBURSEMENT = 'reimbursement',
}

export enum DownPaymentPayType {
  CASH = 'cash',
  BANK = 'bank',
}

export enum DownPaymentState {
  DRAFT = 'draft',
  APPROVED_BY_PIC_HO = 'approved_by_pic_ho',
  APPROVED_BY_SS_SPV = 'approved_by_ss_spv_ho',
  REJECTED = 'rejected',
}

export enum ExpenseState {
  DRAFT = 'draft',
  APPROVED_BY_SS_SPV = 'approved_by_ss_spv_ho',
  APPROVED_BY_PIC = 'approved_by_pic_ho',
  REVERSED = 'reversed',
  REJECTED = 'rejected',
}

export enum ExpensePaymentType {
  CASH = 'cash',
  BANK = 'bank',
}

export enum ExpenseType {
  DOWN_PAYMENT = 'down_payment',
  EXPENSE = 'expense',
}

export enum AccountPaymentPayMethod {
  CASH = 'cash',
  BANK = 'bank',
}

export enum AccountPaymentType {
  PARTIALLY = 'partially',
  FULL = 'full',
}

/**
 * receivable -> Piutang = Hutang perusahaan terhadap karyawan.
 * payable ->  Hutang = Hutang karyawan terhadap perusahaan.
 */
export enum LoanType {
  PAYABLE = 'payable',
  RECEIVABLE = 'receivable',
}

export enum LoanState {
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
  EXPENSE = 'expense',
  // Add other type
}

export enum AccountCoaInternalType {
  TAX = 'tax',
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

export enum MASTER_ROLES {
  SUPERUSER = 'SUPERUSER',
  ACCOUNTING = 'ACCOUNTING',
  PIC_HO = 'PIC HO',
  SS_HO = 'SS HO',
  SPV_HO = 'SPV HO',
  ADMIN_BRANCH = 'ADMIN BRANCH',
  OPS = 'OPS',
  TAX = 'TAX',
}
