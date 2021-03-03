import { User } from '../model/user.entity';
import * as uuid from 'uuid';

const genId = () => {
  return uuid.v4();
}

export const UserSeed = [
  {
    id: '3aa3eac8-a62f-44c3-b53c-31372492f9a0',
    userId: 15,
    employeeId: 2981,
    firstName: 'Adry',
    lastName: 'Adry',
    username: 'adry',
    password: 'd8578edf8458ce06fbc5bb76a58c5ca4',
    loginCount: 1,
    loginAttemptError: null,
    lastLogin: null,
    userIdCreated: 1,
    createdTime: new Date(),
    userIdUpdated: 1,
    updatedTime: new Date(),
    isDeleted: false,
    email: 'adry@sicepat.com',
    passwordReset: null,
    otpReset: null,
  },
  {
    id: genId(),
    userId: 16,
    employeeId: 2982,
    firstName: 'Accounting',
    lastName: 'Accounting',
    username: 'accounting',
    password: 'd8578edf8458ce06fbc5bb76a58c5ca4',
    loginCount: 1,
    loginAttemptError: null,
    lastLogin: null,
    userIdCreated: 1,
    createdTime: new Date(),
    userIdUpdated: 1,
    updatedTime: new Date(),
    isDeleted: false,
    email: 'accounting@sicepat.com',
    passwordReset: null,
    otpReset: null,
  },
  {
    id: genId(),
    userId: 17,
    employeeId: 2983,
    firstName: 'Admin',
    lastName: 'Branch',
    username: 'adminbranch',
    password: 'd8578edf8458ce06fbc5bb76a58c5ca4',
    loginCount: 1,
    loginAttemptError: null,
    lastLogin: null,
    userIdCreated: 1,
    createdTime: new Date(),
    userIdUpdated: 1,
    updatedTime: new Date(),
    isDeleted: false,
    email: 'adminbranch@sicepat.com',
    passwordReset: null,
    otpReset: null,
  }
];
