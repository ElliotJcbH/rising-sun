import { Injectable } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';
import DecodedJwtPayload from "src/common/interface/decoded-jwt-payload.interface";

const REFRESH_TOKEN_EXPIRATION = '30d';
const ACCESS_TOKEN_EXPIRATION = '1h';

@Injectable()
export class TokenService {

    async createTokens(data: Record<string, any>) {

        const refreshToken = this.createRefreshToken(data);
        const accessToken = this.createAccessToken(data);
    
        return { accessToken, refreshToken };
    }

    async createRefreshToken(data: Record<string, any>) {
        const refreshToken = jwt.sign(
            data,
            process.env.JWT_SECRET,
            {expiresIn: REFRESH_TOKEN_EXPIRATION }
        )

        await this.saveRefreshToken(data.userId, refreshToken);

        return refreshToken;
    }
    
    async createAccessToken(data: Record<string, any>) {
        const accessToken = jwt.sign(
            data,
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
        return true;
    }

}