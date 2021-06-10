const RoleAccounting = [
  'period:read',
  'period:create',
  'period:open',
  'period:close',

  'menu.cash.balance.allocation:read',
  'cash.balance.allocation:read',

  'menu.expense:read',
  'down.payment:read',
  'expense:read',
  'expense.attachment:read',

  'menu.journal:read',
  'journal:read',
  'journal:reverse',
  'journal:post',

  'menu.report:read',
  'report.balance:read',
  'report.balance:export',
  'report.budget:read',
  'report.budget:export',
  'report.transaction:read',
  'report.transaction:export',
  'report.down.payment:read',
  'report.down.payment:export',
  'report.profitandloss:read',
  'report.profitandloss:export',
  'report.trialbalance:read',
  'report.trialbalance:export',
  'report.balancesheet:read',
  'report.balancesheet:export',

  'menu.setting:read',
  'setting.product:read',
  'setting.product:create',
  'setting.product:update',

  'setting.partner:read',

  'setting.tax:read',
  'setting.tax:create',
  'setting.tax:update',

  'setting.employee:read',

  'setting.global:read',
  'setting.global:update',
];

export default RoleAccounting;
