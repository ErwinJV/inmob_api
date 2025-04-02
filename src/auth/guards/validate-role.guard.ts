import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Observable } from 'rxjs';

import { META_ROLES } from '../decorators/role-protected.decorator';
import { RequestMessage } from '../classes/request-message.class';

import { User } from 'src/users/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    let user: User | null;

    const type = context.getType();

    if (type === 'http') {
      const req = context.switchToHttp().getRequest<RequestMessage>();
      user = req.user;
    } else {
      const ctx = GqlExecutionContext.create(context);
      user = ctx.getContext<{ req: RequestMessage }>().req.user;
    }

    if (!user) {
      throw new NotFoundException('User not logged');
    }

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      `User ${user.name} need a valid role: ${JSON.stringify(validRoles)}, role searched: ${JSON.stringify(user.roles)}`,
    );
  }
}
