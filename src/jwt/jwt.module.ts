import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CONFIG_OPTIONS } from 'src/common/constants';
import { UserRole } from 'src/user/entity/user-role.entity';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { JwtModuleOptions } from './jwt.interface';
import { JwtService } from './jwt.service';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      imports: [TypeOrmModule.forFeature([User, UserRole])],
      exports: [JwtService],
      providers: [
        { provide: CONFIG_OPTIONS, useValue: options },
        JwtService,
        UserService,
      ],
    };
  }
}
