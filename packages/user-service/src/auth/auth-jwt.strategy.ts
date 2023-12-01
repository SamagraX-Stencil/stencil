import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt";


export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: `-----BEGIN PUBLIC KEY-----\n${process.env.secret}\n-----END PUBLIC KEY-----`,
            algorithms: ['RS256'],
        })
    }

    async validate(payload: any) {
        console.log("VALID");        
        return {roles: payload.roles}
    }
}