import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './config/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Environment } from './config/env/enums/environment.enum';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  if (configService.get('APP_ENV') === Environment.Production) {
    app.useLogger(false);
  }

  const config = new DocumentBuilder()
    .setTitle('Authentication API')
    .setDescription(
      `**Authentication API with Nest.js**  
      You can check the repository [*here*](https://github.com/willy-r/authentication-api)!
      `
    )
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Init server.
  const PORT = configService.get('APP_PORT');

  await app.listen(PORT, () => {
    logger.log(`Server listening on port ⚡ ${PORT}`);
  });
}
bootstrap();
