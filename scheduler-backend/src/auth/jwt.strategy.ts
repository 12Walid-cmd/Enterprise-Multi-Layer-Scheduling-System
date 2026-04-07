import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET!,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,

      first_name: payload.first_name,
      last_name: payload.last_name,
      timezone: payload.timezone,
      working_mode: payload.working_mode,

      group_id: payload.group_id,

      team_ids: payload.team_ids,
      sub_team_ids: payload.sub_team_ids,

      domain_ids: payload.domain_ids,
      domain_team_ids: payload.domain_team_ids,

      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}