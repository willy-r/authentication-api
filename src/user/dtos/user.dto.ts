import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: string;
  email: string;
  name?: string;
  role: string;

  @Exclude()
  hashedPassword: string;
  @Exclude()
  hashedRefreshToken?: string;
  @Exclude()
  createdAt: string;
  @Exclude()
  updatedAt: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
