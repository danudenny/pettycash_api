import { Employee } from '../model/employee.entity';
import { BranchSeed } from './branch.seed';
import { EmployeeRoleSeed } from './employee-role.seed';

const RandomBranchId = () => {
  const datas = BranchSeed.map((v) => v.branchId);
  return datas[Math.floor(Math.random() * datas.length)];
};

const RandomEmployeeRoleId = () => {
  const datas = EmployeeRoleSeed.map((v) => v.employeeRoleId);
  return datas[Math.floor(Math.random() * datas.length)];
};

const GenerateEmployeeRandom = (num: number = 10) => {
  const faker = require('faker');
  faker.locale = 'id_ID';

  const employees: Employee[] = [];
  for (let i = 0; i < num; i++) {
    const e = new Employee();
    e.nik = `${202011839 + i}`;
    e.employeeId = faker.random.number();
    e.name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    e.dateOfEntry = new Date('2020-08-15');
    e.employeeRoleId = RandomEmployeeRoleId();
    e.branchId = RandomBranchId();
    employees.push(e);
  }

  return employees;
};

export default GenerateEmployeeRandom;
