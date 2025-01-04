import { Body, Controller, Post, Put, Request } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginRequestDto } from 'src/auth/dto/login.requests.dto';
import { Public } from '../public.decorator';
import { SignupRequestsDto } from './dto/signup.requests.dto';
import { UpdateUserDto } from './dto/updateUser.requests.dto';
import { UsersService } from './users.service';
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) {}

    @Public()
    @Post('signup')
    async signUp(@Body() dto: SignupRequestsDto) {
        return this.usersService.signUp(dto);
    }

    @Public()
    @Post('login')
    async login(@Body() dto: LoginRequestDto) {
        return this.authService.signIn(dto);
    }

    @Post('logout')
    async logout(@Request() req) {
        return this.authService.signOut(req.user.sub);
    }

    @Put('update')
    async update(@Request() req, @Body() dto: UpdateUserDto) {
        return this.usersService.updateUser(req.user.sub, dto);
    }
}
