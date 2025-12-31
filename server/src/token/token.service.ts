import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from 'jsonwebtoken';
import DecodedJwtPayload from "src/common/interface/decoded-jwt-payload.interface";
import { DatabaseService } from "src/database/database.service";

const REFRESH_TOKEN_EXPIRATION = '30d';
const ACCESS_TOKEN_EXPIRATION = '1h';

@Injectable()
export class TokenService {

     constructor(
        private readonly db: DatabaseService,
        private configService: ConfigService
      ) {}

    async createTokens(data: Record<string, any>): Promise<{accessToken: string, refreshToken: string, user_data: Record<string, any>}> {

        const refreshToken = await this.createRefreshToken(data);
        const accessToken = await this.createAccessToken(data);
    
        return { 
            accessToken, 
            refreshToken,
            user_data: data, 
        };
    }

    async createRefreshToken(data: Record<string, any>) {
        const refreshToken = jwt.sign(
            {
                user_id: data.user_id,
                email: data.email,
                username: data.username,
                email_is_verified: data.email_is_verified,
                metadata: data.metadata
            },
            this.configService.get<string>('JWT_SECRET'),
            {expiresIn: REFRESH_TOKEN_EXPIRATION }
        )

        await this.saveRefreshToken(data.user_id, refreshToken);

        return refreshToken;
    }
    
    async createAccessToken(data: Record<string, any>) {
        const accessToken = jwt.sign(
            {
                user_id: data.user_id,
                email: data.email,
                username: data.username,
                email_is_verified: data.email_is_verified,
                metadata: data.metadata
            },
            this.configService.get<string>('JWT_SECRET'),
            { expiresIn: ACCESS_TOKEN_EXPIRATION } 
        )

        return accessToken;
    }

    async verifyToken(accessToken: string, userId: string) {

        const validAccessPayload = await this.verifyAccessToken(accessToken, userId);
        if(validAccessPayload) return validAccessPayload;
        
        const validRefreshPayload = await this.verifyRefreshToken(userId);
        if(validRefreshPayload) {
            return await this.createAccessToken(validRefreshPayload);
        }

        return null; // user has to re-do authorization steps
    }

    async verifyRefreshToken(userId: string) {

        const query = 'SELECT * FORM auth.refresh_tokens WHERE user_id = $1';
        const result = await this.db.query(query, [userId]);
        
        const refreshToken = result.rows[0].token_id;
        const payload = jwt.verify(
            refreshToken,
            this.configService.get<string>('JWT_SECRET'),
        )

        if(payload) return payload;
       
    }

    async verifyAccessToken(accessToken: string, userId: string) {

        const payload = jwt.verify(
            accessToken, 
            this.configService.get<string>('JWT_SECRET'),
        );    

        if(payload) return payload;

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