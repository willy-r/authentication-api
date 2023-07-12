import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { JwtPayload } from '../../auth/types';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const user: JwtPayload = context.switchToHttp().getRequest().user;
    if (data) {
      return user[data];
    }
    return user;
  }
);
