export enum PeriodState {
  OPEN = 'open',
  CLOSE = 'close',
}

export enum BudgetState {
  DRAFT = 'draft',
  CONFIRMED_BY_SS = 'confirmed_by_ss',
  APPROVED_BY_SPV = 'approved_by_spv',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export enum BudgetRequestState {
  DRAFT = 'draft',
  CONFIRMED_BY_OPS = 'confirmed_by_ops_ho',
  APPROVED_BY_PIC = 'approved_by_pic_ho',
  REJECTED = 'rejected',
  CANCELED = 'canceled',
}

export enum CashBalanceAllocationState {
  DRAFT = 'draft',
  CONFIRMED_BY_SS = 'confirmed_by_ss_ho',
  APPROVED_BY_SPV = 'approved_by_spv_ho',
  REJECTED = 'rejected',
  RECEIVED = 'received',
  TRANSFERRED = 'transferred',
  EXPIRED = 'close',
  CANCELED = 'canceled',
  PAID = 'paid'
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

export enum AccountStatementSourceType {
  DP = 'down_payment',
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

export enum VoucherPaymentType {
  CASH = 'cash',
  BANK = 'bank',
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
  REVERSED = 'reversed',
  REJECTED = 'rejected',
}

export enum ExpenseState {
  DRAFT = 'draft',
  APPROVED_BY_SS_SPV = 'approved_by_ss_spv_ho',
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

export enum ExpenseAssociationType {
  PARTNER = 'partner',
  EMPLOYEE = 'employee'
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

export enum LoanSourceType {
  DP = 'down_payment',
  EXPENSE = 'expense',
  MANUAL = 'manual'
  // Add other type
}

export enum AccountTaxPartnerType {
  PERSONAL = 'personal',
  COMPANY = 'company',
}

export enum JournalState {
  DRAFT = 'draft',
  APPROVED_BY_SS_SPV_HO = 'approved_by_ss_spv_ho',
  APPROVED_BY_TAX = 'approved_by_tax',
  POSTED = 'posted',
  SYNC_FAILED = 'sync_failed',
}

export enum JournalSourceType {
  DP = 'down_payment',
  EXPENSE = 'expense',
  ALOKASI = 'alokasi_saldo',
  PAYMENT = 'payment',
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

export enum ProductTaxType {
  JASA = 'jasa',
  SEWA_ALAT_DAN_KENDARAAN = 'sewa_alat_dan_kendaraan',
  SEWA_BANGUNAN = 'sewa_bangunan',
}

export enum ProductType {
  EXPENSE = 'expense',
  DOWN_PAYMENT = 'down_payment',
}

export enum AccountTaxGroup {
  PPH23 = 'PPH 23',
  PPH21 = 'PPH 21',
  PPH4A2 = 'PPH 4(2)',
}

// export enum AttachmentType {
//   KTP = 'ktp',
//   NPWP = 'npwp',
//   SIUP = 'siup',
//   AKTA_PENDIRIAN = 'akta_pendirian',
//   LAIN_LAIN = 'lain_lain'
// }

export enum AttachmentTypes {
  EXPENSE = 'expense',
  LOAN = 'loan',
  PARTNER = 'partner',
  DAILYCLOSING = 'daily_closing'
}
