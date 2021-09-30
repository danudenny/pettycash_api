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
import { AccountCoaSeed, AssignCoaToBranch } from '../seeders/account-coa.seed';
import { BranchSeed } from '../seeders/branch.seed';
import GlobalSettingSeed from '../seeders/global-setting.seed';
import PartnerSeed from '../seeders/partner.seed';
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
import GenerateEmployeeRandom from '../seeders/employee.seed';
import { Employee } from '../model/employee.entity';
import { Department } from '../model/department.entity';
import { DepartmentSeed } from '../seeders/department.seed';
import { BankBranch } from '../model/bank-branch.entity';
import BankBranchSeed from '../seeders/bank-branch.seed';
import { Product } from '../model/product.entity';
import { ProductSeed } from '../seeders/product.seed';
import { AttachmentType } from '../model/attachment-type.entity';
import AttachmentTypeSeed from '../seeders/attachment-type.seed';
import { EmployeeRole } from '../model/employee-role.entity';
import { EmployeeRoleSeed } from '../seeders/employee-role.seed';
import { Brand } from '../model/brand.entity';
import { BrandSeed } from '../seeders/brand.seed';
import { BrandVehicle } from '../model/brand-vehicle.entity';
import { BrandVehicleSeed } from '../seeders/brand-vehicle.seed';
import { Vehicle } from '../model/vehicle.entity';
import { VehicleSeed } from '../seeders/vehicle.seed';
import { CashflowType } from '../model/cashflow-type.entity';
import { CashFlowTypeSeed } from '../seeders/cashflow-type.seed';

async function run() {
  // init connection
  const connection: Connection = await createConnection(
    LoaderEnv.getTypeOrmConfig() as ConnectionOptions,
  );

  // seed data branch
  await connection.getRepository(Branch).insert(BranchSeed);

  // seed data bank branch
  await connection.getRepository(BankBranch).save(BankBranchSeed);

  // seed data employeeRole
  await connection.getRepository(EmployeeRole).insert(EmployeeRoleSeed);

  // seed data employee
  const employes = GenerateEmployeeRandom(25);
  await connection.getRepository(Employee).insert(employes);

  // seed data department
  await connection.getRepository(Department).save(DepartmentSeed);

  // seed data user
  await connection.getRepository(User).insert(UserSeed);

  // seed data partner
  await connection.getRepository(Partner).save(PartnerSeed);

  // seed data account coa
  await connection.getRepository(AccountCoa).save(AccountCoaSeed);

  await AssignCoaToBranch(connection);

  // seed data product with coa
  await connection.getRepository(Product).save(ProductSeed);

  // seed data account tax
  await connection.getRepository(AccountTax).save(AccountTaxSeed);

  // seed data global setting
  await connection.getRepository(GlobalSetting).save(GlobalSettingSeed);

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
  await connection.getRepository(CashflowType).save(CashFlowTypeSeed);

  // seed data brand
  await connection.getRepository(Brand).insert(BrandSeed);

  // seed data brand vehicle
  await connection.getRepository(BrandVehicle).insert(BrandVehicleSeed);

  // seed data vehicle
  await connection.getRepository(Vehicle).insert(VehicleSeed);

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
