import { Injectable, UnauthorizedException, Optional, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import {
  USER_IDENTITY_VALIDATOR,
  IUserIdentityValidator,
  JwtPayload,
} from '../tokens/user-identity-validator.token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @Optional() @Inject(USER_IDENTITY_VALIDATOR)
    private readonly identityValidator: IUserIdentityValidator | null
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get(
        'JWT_SECRET',
        'super-secret-key-change-in-production'
      ),
    });
  }

  async validate(payload: JwtPayload) {
    if (this.identityValidator) {
      const identity = await this.identityValidator.validate(payload);
      if (!identity) {
        throw new UnauthorizedException();
      }
      return identity;
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
