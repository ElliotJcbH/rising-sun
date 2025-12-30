import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserForm } from './dto/create-user-form.dto';
import { SignInUserForm } from './dto/signin-user-form.dto';
import { hashPassword, verifyPassword } from 'src/utils/auth.utils';
import { TokenService } from 'src/token/token.service';
import { DatabaseService } from 'src/database/database.service';


@Injectable()
export class AuthService {

  constructor(
    private readonly tokenService: TokenService,
    private readonly db: DatabaseService
  ) {}
  
  async createAccount(formData: CreateUserForm): Promise<{refreshToken: string, accessToken: string}> {

    const hash = hashPassword(formData.password);

    const query = 'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING *';
    const user = await this.db.query(query, [formData.username, formData.email, hash])[0];
    
    if(!user) {
      throw new InternalServerErrorException('Failed to create new user');
    }

    return this.tokenService.createTokens(user);

  }

  async verifySignIn(formData: SignInUserForm): Promise<{refreshToken: string, accessToken: string }> {

      if(!formData.email || !formData.password) {
        throw new BadRequestException('Invalid username or password.');
      }

      const query = 'SELECT * FROM users WHERE email = $1';
      const user = await this.db.query(query, [formData.email])[0];

      if(!user.username) {
        throw new NotFoundException('User does not exist');
      }

      if(!await verifyPassword(formData.password, user.password)) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.tokenService.createTokens(user);

  }

}