import { Injectable, NestMiddleware } from '@nestjs/common';
import { ACCESS_TOKEN, AUTH_USER } from 'src/common/constants';
import { UserService } from 'src/user/user.service';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly ueserService: UserService,
  ) {}
  async use(req: any, res: any, next: (error?: any) => void) {
    req[AUTH_USER] = null;
    if (!req.headers[ACCESS_TOKEN]) return next();

    try {
      const decoded = this.jwtService.verify(req.headers[ACCESS_TOKEN]);
      const userId: string = decoded['userId'];

      const user = await this.ueserService.getUserById(userId);
      req[AUTH_USER] = user && {
        ...user,
        isForgetPassword: !!decoded['isForgetPassword'],
      };
    } catch (error) {
      console.log(error);
    } finally {
      next();
    }
  }
}
