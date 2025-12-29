import { Controller, Post, Body } from "@nestjs/common";
import { CreateUserForm } from "./dto/create-user-form.dto";
import { SignInUserForm } from "./dto/signin-user-form.dto";
import { AuthService } from "./auth.service";

@Controller('') 
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    @Post('create')
    createAccount(@Body() formData: CreateUserForm) {
        this.authService.createAccount(formData);
    }

    @Post('signin')
    verifySignIn(@Body() formData: SignInUserForm) {
        this.authService.verifySignIn(formData);
    }

}