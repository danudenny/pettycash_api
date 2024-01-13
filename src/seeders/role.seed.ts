import { Role } from '../model/role.entity';
import { MASTER_ROLES } from '../model/utils/enum';
import { UserSeed } from './user.seed';

const getUserId = () => {
  const userId = UserSeed[0].id;
  return userId;
};

const getRoles = () => {
  const roles: Role[] = [];

  const ROLES = [
    { '007c9b65-c2ef-45bc-bdbf-285cf387c65f': MASTER_ROLES.SUPERUSER },
    { '01d20a69-4e5d-4b61-92c6-658fbc0d3cfe': MASTER_ROLES.ACCOUNTING },
    { '4eb3d0d0-e38c-4593-a350-e73fb32257cb': MASTER_ROLES.PIC_HO },
    { '5b1f3883-1efc-4d4e-893c-0cde3d3862d8': MASTER_ROLES.SS_HO },
    { '1e22a734-d813-4f11-8f9d-37feeccf7a4f': MASTER_ROLES.SPV_HO },
    { '25297b27-ed90-48b8-9b82-63853f8a4f6d': MASTER_ROLES.ADMIN_BRANCH },
    { '1862f431-c4e6-4df1-b573-8730f3d795bb': MASTER_ROLES.OPS },
    { '44123a04-1e5c-4ccc-85c6-92319f258374': MASTER_ROLES.TAX },
  ];

  ROLES.map((ro) => {
    const key = Object.keys(ro)[0];
    const val = Object.values(ro)[0];

    const r = new Role();
    r.id = key;
    r.name = val;
    r.createUserId = getUserId();
    r.updateUserId = getUserId();
    roles.push(r);
  });

  return roles;
};

const RoleSeed = getRoles();

export default RoleSeed;
