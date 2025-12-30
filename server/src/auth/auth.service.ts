import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserForm } from './dto/create-user-form.dto';
import { SignInUserForm } from './dto/signin-user-form.dto';
import { hashPassword, verifyPassword } from 'src/utils/auth.utils';
import { TokenService } from 'src/token/token.service';


@Injectable()
export class AuthService {

  constructor(private readonly tokenService: TokenService) {}
  
  async createAccount(formData: CreateUserForm) {

    const hash = hashPassword(formData.password);

  }


  async verifySignIn(formData: SignInUserForm): Promise<{refreshToken: string, accessToken: string }> {

      if(!formData.email || !formData.password) {
        throw new BadRequestException('Invalid username or password.');
      }

      const user = {
        username: '',
        password: ''
      };

      if(!user.username || !user.password) {
        throw new NotFoundException('User does not exist');
      }

      if(await verifyPassword(formData.password, user.password)) {
        return this.tokenService.createTokens(user); // returns {refreshToken, accessToken}
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }

  }

}