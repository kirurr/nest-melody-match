// src/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: { userId: number } = ctx.switchToHttp().getRequest();
    return request.userId; // Или любое другое поле, которое вы хотите извлечь
  },
);
