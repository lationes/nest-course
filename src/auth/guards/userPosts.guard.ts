import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";
import {Reflector} from "@nestjs/core";
import {ROLES_KEY} from "../roles-auth.decorator";

@Injectable()
export class UserPostsGuard implements CanActivate {

    constructor(private jwtService: JwtService,
                private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ])

            if (!requiredRoles) {
                return true;
            }

            const req = context.switchToHttp().getRequest();
            const { userId } = req.params;
            const {id, roles} = req.user;

            const isQueryForCurrentUser = Number(userId) === Number(id);

            return roles.some(role => requiredRoles.includes(role)) || isQueryForCurrentUser;
        } catch (e) {
            console.log(e)
            throw new HttpException('User has no acess to this operation', HttpStatus.FORBIDDEN);
        }

    }
}