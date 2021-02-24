import ListPermissions from './permission';

// This is special role, superuser role mean can access all permissions.
// if you want to add special permission, please add in
// `./permission.ts` file.
const RoleSuperuser = ListPermissions;

export default RoleSuperuser;
