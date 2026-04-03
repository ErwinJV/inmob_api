import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { RequestMessage } from '../classes/request-message.class';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // Cambiamos al contexto HTTP y obtenemos la request
    const request = ctx.switchToHttp().getRequest<RequestMessage>();

    // Retornamos el usuario inyectado en la request (usualmente por un Guard)
    return request.user;
  },
);
