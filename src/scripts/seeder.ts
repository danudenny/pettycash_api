// tslint:disable: no-console
import { ConnectionOptions, createConnection, Connection } from 'typeorm';
import { LoaderEnv } from '../config/loader';
import { AccountCoa } from '../model/account-coa.entity';
import { Branch } from '../model/branch.entity';
import { GlobalSetting } from '../model/global-setting.entity';
import { Partner } from '../model/partner.entity';
import { Permission } from '../model/permission.entity';
import { Role } from '../model/role.entity';
import { User } from '../model/user.entity';
import AccountCoaSeed from '../seeders/account-coa.seed';
import { BranchSeed } from '../seeders/branch.seed';
import GlobalSettingSeed from '../seeders/global-setting.seed';
import PartnerSeed from '../seeders/partner.seed';
import PermissionSeed from '../seeders/permission.seed';
import RoleSeed from '../seeders/role.seed';
import { UserSeed } from '../seeders/user.seed';

import { AssignRandomUserToRole, ResetRolePermission, SeedRolePermission } from '../seeders/role-permission.seed';

async function run() {
  // init connection
  const connection: Connection = await createConnection(
    LoaderEnv.getTypeOrmConfig() as ConnectionOptions,
  );

  // seed data branch
  await connection.getRepository(Branch).insert(BranchSeed);

  // seed data user
  await connection.getRepository(User).insert(UserSeed);

  // seed data partner
  await connection.getRepository(Partner).save(PartnerSeed);

  // seed data account coa
  await connection.getRepository(AccountCoa).save(AccountCoaSeed);

  // seed data global setting
  await connection.getRepository(GlobalSetting).save(GlobalSettingSeed);

  // --- Role and Permissions --- //
  /**
   * Use this method to remove all mapped role permission
   * before deleting permission and role
   */
  // await ResetRolePermission(connection);

  // seed data permission
  // await connection.getRepository(Permission).delete({});
  await connection.getRepository(Permission).save(PermissionSeed);

  // seed data roles
  // await connection.getRepository(Role).delete({});
  await connection.getRepository(Role).save(RoleSeed);

  // seed data mapping role and permission
  await SeedRolePermission(connection);

  // assign random user to role
  await AssignRandomUserToRole(connection);
  // --- End Role and Permissions --- //

  // Close connection after running seeder.
  await connection.close();
}

(async function () {
  console.log(`Running seeder...`);
  try {
    await run();
  } catch (error) {
    console.error('Seed error', error);
    throw error;
  }
  console.log('Seeder successfully applied!');
})();
