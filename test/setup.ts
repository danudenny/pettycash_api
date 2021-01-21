import { Connection, createConnection } from 'typeorm';

jest.setTimeout(5 * 60 * 1000);

const connection: Connection = null;

beforeAll(async () => {
  const ormConfig = require('../src/config/typeorm.config.cli');
  await createConnection(Object.assign(ormConfig, { name: 'unit_test' }));
});

afterAll(async () => {
  if (connection) {
    await connection.close();
  }
});
