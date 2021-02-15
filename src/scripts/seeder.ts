// tslint:disable: no-console
import { ConnectionOptions, createConnection } from 'typeorm';
import { LoaderEnv } from '../config/loader';
import { AccountCoa } from '../model/account-coa.entity';
import { Branch } from '../model/branch.entity';
import { GlobalSetting } from '../model/global-setting.entity';
import { Partner } from '../model/partner.entity';
import { User } from '../model/user.entity';
import AccountCoaSeed from '../seeders/account-coa.seed';
import { BranchSeed } from '../seeders/branch.seed';
import GlobalSettingSeed from '../seeders/global-setting.seed';
import PartnerSeed from '../seeders/partner.seed';
import { UserSeed } from '../seeders/user.seed';

async function run() {
  // init connection
  const connection = await createConnection(
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
