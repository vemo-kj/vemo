import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { LoginRequestDto } from 'src/auth/dto/login.requests.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { SignupRequestsDto } from './dto/signup.requests.dto';
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

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Request() req) {
        return this.authService.signOut(req.user.sub);
    }
}
