import { Connection, In } from 'typeorm';
import { Role } from '../model/role.entity';
import { Permission } from '../model/permission.entity';
import { MASTER_ROLES } from '../model/utils/enum';
import RoleAccounting from './role-permission/role-accounting';
import RolePICHO from './role-permission/role-pic-ho';
import RoleSuperuser from './role-permission/role-superuser';
import RoleSSHO from './role-permission/role-ss-ho';
import RoleSPVHO from './role-permission/role-spv-ho';
import RoleAdminBranch from './role-permission/role-admin-branch';
import RoleOPS from './role-permission/role-ops';
import RoleTax from './role-permission/role-tax';
import { User } from '../model/user.entity';
import { Branch } from '../model/branch.entity';

const getRole = async (name: string, conn: Connection): Promise<Role> => {
  const search = await conn.getRepository(Role).findOne({
    where: { name },
  });
  return search;
};

const getPermission = async (
  name: string[],
  conn: Connection,
): Promise<Permission[]> => {
  const search = await conn.getRepository(Permission).find({
    where: {
      name: In(name),
    },
  });
  return search;
};

const assignRolePermission = async (
  role: string,
  perm: string[],
  conn: Connection,
) => {
  const cRole = await getRole(role, conn);
  const cPerm = await getPermission(perm, conn);

  if (!cRole) {
    throw new Error(`Role for ${role} not found!`);
  }

  cRole.permissions = cPerm;
  return await conn.getRepository(Role).save(cRole);
};

const asssignUserToRole = async (
  username: string,
  role: string,
  conn: Connection,
) => {
  const userRepo = conn.getRepository(User);
  const branchRepo = conn.getRepository(Branch);
  const cUser: User = await userRepo.findOne({ where: { username } });
  if (!cUser) return;
  cUser.role = await getRole(role, conn);
  const take = username !== 'admin' ? 2 : 1;
  cUser.branches = await branchRepo.find({ take, order: { branchId: 'ASC' } });
  return await userRepo.save(cUser);
};

const AssignRandomUserToRole = async (conn: Connection) => {
  await asssignUserToRole('adry', MASTER_ROLES.SUPERUSER, conn);
  await asssignUserToRole('superuser', MASTER_ROLES.SUPERUSER, conn);
  await asssignUserToRole('accounting', MASTER_ROLES.ACCOUNTING, conn);
  await asssignUserToRole('tax', MASTER_ROLES.TAX, conn);
  await asssignUserToRole('pic_ho', MASTER_ROLES.PIC_HO, conn);
  await asssignUserToRole('ss_ho', MASTER_ROLES.SS_HO, conn);
  await asssignUserToRole('spv_ho', MASTER_ROLES.SPV_HO, conn);
  await asssignUserToRole('admin', MASTER_ROLES.ADMIN_BRANCH, conn);
  await asssignUserToRole('ops', MASTER_ROLES.OPS, conn);
  return;
};

const ResetRolePermission = async (conn: Connection) => {
  const q = `DELETE FROM "role_permission"`;
  return await conn.query(q);
};

const SeedRolePermission = async (conn: Connection) => {
  // Assign Role with Permissions
  await assignRolePermission(MASTER_ROLES.SUPERUSER, RoleSuperuser, conn);
  await assignRolePermission(MASTER_ROLES.ACCOUNTING, RoleAccounting, conn);
  await assignRolePermission(MASTER_ROLES.PIC_HO, RolePICHO, conn);
  await assignRolePermission(MASTER_ROLES.SS_HO, RoleSSHO, conn);
  await assignRolePermission(MASTER_ROLES.SPV_HO, RoleSPVHO, conn);
  await assignRolePermission(MASTER_ROLES.ADMIN_BRANCH, RoleAdminBranch, conn);
  await assignRolePermission(MASTER_ROLES.OPS, RoleOPS, conn);
  await assignRolePermission(MASTER_ROLES.TAX, RoleTax, conn);
};

export { ResetRolePermission, SeedRolePermission, AssignRandomUserToRole };
