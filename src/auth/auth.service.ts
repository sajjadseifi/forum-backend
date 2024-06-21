import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { LoginDTO } from './dto/login.dto';
import { RegisterAuthDTO } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from 'src/jwt/jwt.service';
import { EditRegisteredProfile } from './dto/edit-regitered-profile.dto';
import * as _ from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService, // private readonly inboxService: InboxService,
  ) {}

  findByEmail(email: string) {
    try {
      return this.userRepository.findOne({ where: { email } });
    } catch {
      return null;
    }
  }

  findByUsername(username: string) {
    try {
      return this.userRepository.findOne({ where: { username } });
    } catch {
      return null;
    }
  }

  async createAccount(registerDto: RegisterAuthDTO) {
    let user = await this.findByEmail(registerDto.email);
    user = user ?? (await this.findByUsername(registerDto.email));

    if (user) {
      throw new BadRequestException('user already exists');
    }

    user = this.userRepository.create(registerDto);

    user = await this.userRepository.save(user);

    const registeredToken = this.jwtService.sign({
      userId: user.id,
    });

    await this.userRepository.update(user.id, { registeredToken });
    user.registeredToken = registeredToken;
    // await this.inboxService.createInbox(user);
    return user;
  }

  async loginAccount(loginDto: LoginDTO): Promise<User> {
    const { email, password } = loginDto;
    // await this.userRepository.update(
    //   { email },
    //   {
    //     verificationCode: null,
    //     verifyed: true,
    //   },
    // );
    const user = await this.userRepository.findOne({
      select: ['id', 'username', 'email', 'password', 'verifyed'],
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
    const user = await this.userRepository.findOne({
      select: ['id', 'password'],
      where: { id: userId },
    });
    const prevPass = await bcrypt.compare(password, user.password);

    if (prevPass) {
      throw new BadRequestException(
        'رمز عبور شما قبلا استفاده شده لطفا رمز عبور دیگری انتخاب کنید',
      );
    }
    user.password = password;

    try {
      await this.userRepository.save(user);
      return {
        ok: true,
        message: 'گذرواژه با موفقیت تغییر یافت',
      };
    } catch (error) {
      throw new InternalServerErrorException('گذرواژه تغییر نیافت');
    }
  }
  async editPofileRegistered(
    userId: string,
    registeredToken: string,
    editRegisteredProfile: EditRegisteredProfile,
  ) {
    const user = await this.userRepository.findOne({
      select: ['id', 'registeredToken'],
      where: {
        id: userId,
        registeredToken,
      },
    });
    if (!user) throw new UnauthorizedException(`کاربر قابلیت ویرایش را ندارد.`);

    const pcikedEditDto = _.pick(editRegisteredProfile, [
      'firstName',
      'lastName',
      'avatar',
      'bio',
      'birthDate',
    ]);
    if (pcikedEditDto.birthDate) {
      pcikedEditDto.birthDate = new Date(pcikedEditDto.birthDate);
    } else {
      delete pcikedEditDto.birthDate;
    }

    const result = await this.userRepository.update(userId, {
      ...pcikedEditDto,
      registeredToken: null,
    });
    return {
      ok: result.affected > 0,
    };
  }

  async verifiedAccount(code: string) {
    const user = await this.userRepository.findOne({
      select: ['id', 'verificationCode', 'username', 'email'],
      where: {
        verificationCode: code,
      },
    });

    if (!user) {
      throw new BadRequestException(`verification code not valid`);
    }

    await this.userRepository.update(user.id, {
      verificationCode: null,
      verifyed: true,
    });

    return user;
  }
  async generateVarificationsCode(user: User) {
    user.genVerificationCode();
    await this.userRepository.update(user.id, {
      verificationCode: user.verificationCode,
    });
    const u = await this.userRepository.findOne({ id: user.id });
    return user.verificationCode;
  }
}
