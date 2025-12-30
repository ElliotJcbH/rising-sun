
interface DecodedJwtPayload {
    
    userId: string;
    email: string;
    username: string;
    role: string;
    emailVerifiedAt: string;

}

export default DecodedJwtPayload;