import RoleAccounting from './role-accounting';
import RoleAdminBranch from './role-admin-branch';
import RoleOPS from './role-ops';
import RolePICHO from './role-pic-ho';
import RoleSPVHO from './role-spv-ho';
import RoleSSHO from './role-ss-ho';
import RoleTax from './role-tax';

/**
 * Add other permission here
 * which is not used on other role
 * except for `superuser`.
 */
const OtherPermission = [
  'setting.global:update',
  'setting.cashflow.type:read',
  'setting.cashflow.type:create',
  'setting.cashflow.type:update',
];

/**
 * Insert all Role Permissions here except for role `RoleSuperuser`.
 * because `RoleSuperuser` is equal to this ListPermissions.
 *
 * Permission should be unique.
 */
const ListPermissions = [
  ...new Set([
    ...RoleAccounting,
    ...RolePICHO,
    ...RoleSSHO,
    ...RoleSPVHO,
    ...RoleAdminBranch,
    ...RoleOPS,
    ...RoleTax,
    ...OtherPermission,
  ]),
];

export default ListPermissions;
