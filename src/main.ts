import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // App core.
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(bootstrap.name);

  // Services.
  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  // Initial configs.
  await prismaService.enableShutdownHooks(app);
  app.enableCors({
    origin: configService.get('APP_ALLOWED_ORIGINS').split(';'),
  });

  // Init server.
  const PORT = configService.get('APP_PORT');

  await app.listen(PORT, () => {
    logger.log(`Server listening on port ⚡ ${PORT}`);
  });
}
bootstrap();
