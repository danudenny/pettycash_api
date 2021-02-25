import RoleSSHO from './role-ss-ho';

// Add Additional permission here for SPV HO.
const AdditionalPermission = [];

// Currently SS HO and SPV HO has same permission.
const RoleSPVHO = [...new Set([...RoleSSHO, ...AdditionalPermission])];

export default RoleSPVHO;
