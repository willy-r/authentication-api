import { Module, ValidationPipe } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { JwtGuard } from './auth/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // Only DTO fields are allowed.
      }),
    },
  ],
})
export class AppModule {}
