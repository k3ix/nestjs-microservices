import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../constants/services';
import { UserDto } from '@app/common/dto';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const jwt = context.switchToHttp().getRequest().cookies?.Authentication;
    if (!jwt) {
      throw new UnauthorizedException();
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    return this.authClient.send('authenticate', { Authentication: jwt }).pipe(
      tap((res: UserDto) => {
        if (roles) {
          for (const role of roles) {
            if (!res.roles?.includes(role)) {
              this.logger.error('The user  does nor have valid roles.');
              throw new UnauthorizedException();
            }
          }
        }
        context.switchToHttp().getRequest().user = res;
      }),
      map(() => true),
      catchError((err) => {
        this.logger.error(err);
        return of(false);
      }),
    );
  }
}
