import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { LoginDTO } from './dto/login.dto';
import { RegisterAuthDTO } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  async createAccount(registerDto: RegisterAuthDTO) {
    let user = await this.findByEmail(registerDto.email);
    user = user ?? (await this.findByUsername(registerDto.email));

    if (user) {
      throw new BadRequestException('user already exists');
    }

    user = this.userRepository.create(registerDto);

    return this.userRepository.save(user);
  }

  async loginAccount(loginDto: LoginDTO): Promise<User> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({
      select: ['id', 'username', 'password'],
      where: { email },
    });
    const passwordCorrect = user ? await user.checkPassword(password) : false;
    if (!user || !passwordCorrect) {
      throw new NotFoundException(`Email or Password is InCorrect`);
    }
    return user;
  }

  async getUserAuthById(userId: string) {
    return this.userRepository.findOne({
      select: ['id', 'username', 'password'],
      where: { id: userId },
    });
  }

  async resetUserPassword(userId: string, password: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const prevPass = await bcrypt.compare(password, user.password);

    if (prevPass) {
      throw new BadRequestException(
        'رمز عبور شما قبلا استفاده شده لطفا رمز عبور دیگری انتخاب کنید',
      );
    }

    user.password = password;
    try {
      await this.userRepository.update(user.id, user);
      return true;
    } catch (error) {
      return false;
    }
  }
}
