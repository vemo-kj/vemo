import { Request } from 'express';
import { Users } from '../../users/users.entity';

export interface RequestWithUserInterface extends Request {
    user: Users;
}
