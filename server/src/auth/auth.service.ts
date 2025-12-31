import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserForm } from './dto/create-user-form.dto';
import { SignInUserForm } from './dto/signin-user-form.dto';
import { hashPassword, verifyPassword } from 'src/utils/auth.utils';
import { TokenService } from 'src/common/providers/token/token.service';
import { DatabaseService } from 'src/common/providers/database/database.service';
import { SessionInfoDto } from './dto/session-info.dto';


@Injectable()
export class AuthService {

  constructor(
    private readonly tokenService: TokenService,
    private readonly db: DatabaseService
  ) {}
  
  async createAccount(formData: CreateUserForm): Promise<SessionInfoDto> {

    const hash = hashPassword(formData.password);

    const query = 'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING user_id, username, email, email_verified_at, metadata, created_at';
    const result = await this.db.query(query, [formData.username, formData.email, hash]);
    
    const user = result.rows[0];
    if(!user) {
      throw new InternalServerErrorException('Failed to create new user');
    }

    return this.tokenService.createTokens(user);

  }

  async verifySignIn(formData: SignInUserForm): Promise<SessionInfoDto> {

      if(!formData.email || !formData.password) {
        throw new BadRequestException('Invalid username or password.');
      }

      const query = 'SELECT user_id, username, email, email_verified_at, metadata, created_at FROM users WHERE email = $1';
      const result = await this.db.query(query, [formData.email]);

      const user = result.rows[0];
      if(!user.username) {
        throw new NotFoundException('User does not exist');
      }

      if(!await verifyPassword(formData.password, user.password)) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return this.tokenService.createTokens(result);

  }

  async verifySession(sessionInfo: SessionInfoDto): Promise<SessionInfoDto> {

    const newSessionInfo = this.tokenService.verifyToken(sessionInfo.accessToken, sessionInfo.user.user_id);

    return newSessionInfo;

  }

}