import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const AuthorizedUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: { userId: number | undefined } = ctx.switchToHttp().getRequest();
    if (!request.userId) {
      throw new UnauthorizedException('User is not authorized');
    }
    return request.userId; 
  },
);
