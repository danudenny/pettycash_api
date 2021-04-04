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
    e.npwpNumber = faker.finance.creditCardNumber();
    e.idCardNumber = `${faker.finance.creditCardNumber()}`
      .trim()
      .replace(/-/g, '');
    e.positionId = faker.random.number();
    e.positionName = faker.name.jobTitle();
    e.branchId = faker.random.number();
    employees.push(e);
  }

  return employees;
};

export default GenerateEmployeeRandom;
