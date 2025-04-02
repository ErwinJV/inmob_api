import { applyDecorators, UseGuards } from '@nestjs/common';

import { ValidRoles } from 'src/common/enums/valid-roles.enum';

import { UserRoleGuard } from '../guards/validate-role.guard';

import { RoleProtected } from './role-protected.decorator';
import { GqlAuthGuard } from '../guards/gql-auth.guard';

export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(GqlAuthGuard, UserRoleGuard),
  );
}
