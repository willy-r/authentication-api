import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(bootstrap.name);

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  await prismaService.enableShutdownHooks(app);

  const PORT = configService.get('APP_PORT');

  await app.listen(PORT, () => {
    logger.log(`Server listening on port ⚡ ${PORT}`);
  });
}
bootstrap();
