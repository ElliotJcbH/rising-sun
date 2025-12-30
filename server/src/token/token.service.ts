import { Injectable } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import DecodedJwtPayload from "src/common/interface/decoded-jwt-payload.interface";
import { DatabaseService } from "src/database/database.service";

const REFRESH_TOKEN_EXPIRATION = '30d';
const ACCESS_TOKEN_EXPIRATION = '1h';

@Injectable()
export class TokenService {

     constructor(
        private readonly db: DatabaseService
      ) {}

    async createTokens(data: Record<string, any>): Promise<{accessToken: string, refreshToken: string}> {

        const refreshToken = await this.createRefreshToken(data);
        const accessToken = await this.createAccessToken(data);
    
        return { accessToken, refreshToken };
    }

    async createRefreshToken(data: Record<string, any>) {
        const refreshToken = jwt.sign(
            {
                userId: data.user_id,
                email: data.email,
                username: data.username,
                emailIsVerified: data.email_is_verified,
                metadata: data.metadata
            },
            process.env.JWT_SECRET,
            {expiresIn: REFRESH_TOKEN_EXPIRATION }
        )

        await this.saveRefreshToken(data.userId, refreshToken);

        return refreshToken;
    }
    
    async createAccessToken(data: Record<string, any>) {
        const accessToken = jwt.sign(
            {
                userId: data.user_id,
                email: data.email,
                username: data.username,
                emailIsVerified: data.email_is_verified,
                metadata: data.metadata
            },
            process.env.JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRATION } 
        )

        return accessToken;
    }

    async verifyRefreshToken(refreshToken: string) {

    }

    async verifyAccessToken(accessToken: string) {

    }

    parseToken(token: string): DecodedJwtPayload {
        return jwt.decode(token);
    }

    async saveRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
        
        const query = 'INSERT INTO auth.refresh_tokens(token_id, user_id) VALUES($1, $2) RETURNING token_id';

        if(await this.db.query(query, [refreshToken, userId])[0]) return true;

        return false;
    }

}