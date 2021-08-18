const RoleAdminBranch = [
  'period:read',

  'menu.budget:read',
  'budget.request:read',
  'budget.request:create',

  'menu.cash.balance.allocation:read',
  'cash.balance.allocation:read',

  'menu.balance:read',
  'balance.transfer:read',
  'balance.transfer:create',
  'daily.closing.transaction:read',
  'daily.closing.transaction:create',
  'historical.balance:read',

  'menu.expense:read',
  'down.payment:read',
  'down.payment:create',
  'down.payment:update',
  'expense:read',
  'expense:create',
  'expense:update',
  'expense.attachment:read',
  'expense.attachment:create',
  'loan:read',
  'loan:create',
  'loan:pay',
  'loan.attachment:read',
  'loan.attachment:create',

  'menu.voucher:read',
  'voucher:read',
  'voucher:refresh',
  'voucher:approve',

  'menu.setting:read',
  'setting.product:read',
  'setting.product:create',
  'setting.product:update',
  'setting.employee:read',
];

export default RoleAdminBranch;
