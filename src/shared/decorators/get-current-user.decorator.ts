import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const { user } = context.switchToHttp().getRequest();
    if (data) {
      return user[data];
    }
    return user;
  }
);
