import { Controller, Post, Body, Res, UnauthorizedException, Req, Get } from "@nestjs/common";
import { CreateUserForm } from "./dto/create-user-form.dto";
import { SignInUserForm } from "./dto/signin-user-form.dto";
import { AuthService } from "./auth.service";
import type { Response, Request } from "express";
import { SessionInfoDto } from "./dto/session-info.dto";

@Controller('') 
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('create')
    async createAccount(@Body() formData: CreateUserForm, @Res({passthrough: true}) res: Response) {
        
        const sessionInfo = await this.authService.createAccount(formData);

        res.json(sessionInfo)
    }

    @Post('signin')
    async verifySignIn(@Body() formData: SignInUserForm, @Res({passthrough: true}) res: Response) {

        const sessionInfo = await this.authService.verifySignIn(formData);

        res.json(sessionInfo)
    }

    @Get('verify-session')
    async verifySession(@Body() sessionInfo: SessionInfoDto, @Res({passthrough: true}) res: Response) {

        const newSessionInfo = await this.authService.verifySession(sessionInfo);

        res.json(newSessionInfo)

    }

}

// res.cookie('accessToken', accessToken, {
//     httpOnly: true,
//     // secure: true, unset or set to false for dev
//     // sameSite: 'strict'
//     maxAge: 60 * 60 * 1000
// })

// res.cookie('refreshToken', refreshToken, {
//     httpOnly: true,
//     // secure: true, unset or set to false for dev
//     // sameSite: 'strict'
//     maxAge: 30 * 24 * 60 * 60 * 1000
// })