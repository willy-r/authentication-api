import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';
import { Environment } from './enums/environment.enum';

class EnvironmentVariables {
  @IsEnum(Environment)
  APP_ENV: Environment;

  @IsNumber()
  APP_PORT: number;

  @IsString()
  APP_ALLOWED_ORIGINS: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  ACCESS_TOKEN_EXPIRES: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  REFRESH_TOKEN_EXPIRES: string;
}

export function validate(
  config: Record<string, unknown>
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
