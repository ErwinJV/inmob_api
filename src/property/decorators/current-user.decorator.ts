import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IncomingMessage } from 'http';
import { User } from 'src/users/entities/user.entity';

class RequestMessage extends IncomingMessage {
  user: User;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);

    return ctx.getContext<{ req: RequestMessage }>().req.user;
  },
);
