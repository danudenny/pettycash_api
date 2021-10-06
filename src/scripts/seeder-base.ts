// tslint:disable: no-console
import { ConnectionOptions, createConnection, Connection } from 'typeorm';
import { LoaderEnv } from '../config/loader';
import { GlobalSetting } from '../model/global-setting.entity';
import { Permission } from '../model/permission.entity';
import { Role } from '../model/role.entity';
import { User } from '../model/user.entity';
import PermissionSeed from '../seeders/permission.seed';
import RoleSeed from '../seeders/role.seed';
import { UserSeed } from '../seeders/user.seed';

import {
  AssignRandomUserToRole,
  ResetRolePermission,
  SeedRolePermission,
} from '../seeders/role-permission.seed';
import { AccountTax } from '../model/account-tax.entity';
import { AccountTaxSeed } from '../seeders/tax.seed';
import { AttachmentType } from '../model/attachment-type.entity';
import AttachmentTypeSeed from '../seeders/attachment-type.seed';
import { CashflowType } from '../model/cashflow-type.entity';
import { CashFlowTypeSeed } from '../seeders/cashflow-type.seed';

async function run() {
  // init connection
  const connection: Connection = await createConnection(
    LoaderEnv.getTypeOrmConfig() as ConnectionOptions,
  );

  // seed data user
  await connection.getRepository(User).insert(UserSeed);

  // seed data account tax
  // NOTE: Should Assign coaId manually
  const taxes = AccountTaxSeed.map((tax) => {
    delete tax.coaId;
    return tax;
  });
  await connection.getRepository(AccountTax).save(taxes);

  // seed data global setting
  const settings = new GlobalSetting();
  settings.deviationAmount = 1000;
  await connection.getRepository(GlobalSetting).save(settings);

  // seed data attachment type
  await connection.getRepository(AttachmentType).save(AttachmentTypeSeed);

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

  // seed data cashflow type
  // NOTE: Should Assign coaId manually
  const cashflow = CashFlowTypeSeed.map((i) => {
    delete i.coaId;
    return i;
  });
  await connection.getRepository(CashflowType).save(cashflow);

  // Close connection after running seeder.
  await connection.close();
}

(async function () {
  console.log(`Running seeder base...`);
  try {
    await run();
  } catch (error) {
    console.error('Seed base error', error);
    throw error;
  }
  console.log('Seeder base successfully applied!');
})();
