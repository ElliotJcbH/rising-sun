import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "src/token/token.service";
import { DatabaseService } from "src/database/database.service";

@Module({
    imports: [],
    controllers: [AuthController],
    providers: [AuthService, TokenService, DatabaseService],
    exports: [AuthService]
})
export class AuthModule{}