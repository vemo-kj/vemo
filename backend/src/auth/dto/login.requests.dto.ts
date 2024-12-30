import { PickType } from '@nestjs/mapped-types';
import { User } from '../../users/users.entity';

export class LoginRequestDto extends PickType(User, ['email', 'password'] as const) {}
