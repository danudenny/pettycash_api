import { Permission } from '../model/permission.entity';
import ListPermissions from './role-permission/permission';
import { UserSeed } from './user.seed';

const getUserId = () => {
  const userId = UserSeed[0].id;
  return userId;
};

const getPermissions = () => {
  const permissions: Permission[] = [];

  // Assign all ListPermissions as Permission
  // if you want add new role or permission
  // please add in `./role-permission/permission.ts` file.
  ListPermissions.map((permission) => {
    const p = new Permission();
    p.name = permission;
    p.createUserId = getUserId();
    p.updateUserId = getUserId();
    permissions.push(p);
  });

  return permissions;
};

const PermissionSeed = getPermissions();

export default PermissionSeed;
