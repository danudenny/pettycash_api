// tslint:disable: no-console
import { ConnectionOptions, createConnection } from 'typeorm';
import { LoaderEnv } from '../config/loader';
import { Branch } from '../model/branch.entity';
import { User } from '../model/user.entity';
import { BranchSeed } from '../seeders/branch.seed';
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

  // Close connection after running seeder.
  await connection.close();
}

(async function() {
  console.log(`Running seeder...`);
  try {
    await run();
  } catch (error) {
    console.error('Seed error', error);
    throw error;
  }
  console.log('Seeder successfully applied!');
})();
