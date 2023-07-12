import { SetMetadata } from '@nestjs/common';

export const MakePublic = () => SetMetadata('isPublicRoute', true);
