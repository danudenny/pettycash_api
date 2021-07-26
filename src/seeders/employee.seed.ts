import { Employee } from '../model/employee.entity';

const GenerateEmployeeRandom = (num: number = 10) => {
  const faker = require('faker');
  faker.locale = 'id_ID';

  const employees: Employee[] = [];
  for (let i = 0; i < num; i++) {
    const e = new Employee();
    e.nik = `${202011839 + i}`;
    e.employeeId = faker.random.number();
    e.name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    e.employeeRoleId = faker.random.number();
    e.branchId = faker.random.number();
    employees.push(e);
  }

  return employees;
};

export default GenerateEmployeeRandom;
