import { Controller, Post, Body, Res, UnauthorizedException, Req } from "@nestjs/common";
import { CreateUserForm } from "./dto/create-user-form.dto";
import { SignInUserForm } from "./dto/signin-user-form.dto";
import { AuthService } from "./auth.service";
import type { Response, Request } from "express";

@Controller('') 
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('create')
    createAccount(@Body() formData: CreateUserForm) {
        this.authService.createAccount(formData);
    }

    @Post('signin')
    async verifySignIn(@Body() formData: SignInUserForm, @Req() req: Request, @Res({passthrough: true}) res: Response) {
        
        const { refreshToken, accessToken } = await this.authService.verifySignIn(formData);

        if(!refreshToken || !accessToken) {
            throw new UnauthorizedException('Invalid Tokens'); // probably not the best?
        }

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            // secure: true, unset or set to false for dev
            // sameSite: 'strict'
            maxAge: 60 * 60 * 1000
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            // secure: true, unset or set to false for dev
            // sameSite: 'strict'
            maxAge: 30 * 24 * 60 * 60 * 1000
        })
        
    }

}