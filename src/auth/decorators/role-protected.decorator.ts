import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from 'src/common/enums/valid-roles.enum';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {
  return SetMetadata(META_ROLES, args);
};
