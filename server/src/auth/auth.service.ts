import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserForm } from './dto/create-user-form.dto';
import { SignInUserForm } from './dto/signin-user-form.dto';
import { hashPassword, verifyPassword } from 'src/utils/auth.utils';


@Injectable()
export class AuthService {
  
  async createAccount(formData: CreateUserForm) {

    const hash = hashPassword(formData.password);

  }


  async verifySignIn(formData: SignInUserForm) {

      if(!formData.email || !formData.password) {
        throw new BadRequestException('Invalid username or password.');
      }

      const user: { username: string, password: string } = {
        username: '',
        password: ''
      };

      if(!user.username || !user.password) {
        throw new NotFoundException('User does not exist');
      }

      if(await verifyPassword(formData.password, user.password)) {
        // handle
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }

  }

}