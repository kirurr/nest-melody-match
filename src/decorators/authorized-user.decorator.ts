import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const AuthorizedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: { user: { id: number } | undefined } = ctx
      .switchToHttp()
      .getRequest();
    if (!request.user) {
      throw new UnauthorizedException('User is not authorized');
    }
    return request.user;
  },
);
