import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { HelperService } from 'src/helper/helper.service';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/user/user.entity';
import { AuthService } from './auth.service';
import { EditRegisteredProfile } from './dto/edit-regitered-profile.dto';
import { ForgetPasswrdOutputDTO } from './dto/forget-password.dto';
import { LoginDTO, LoginOutputDTO } from './dto/login.dto';
import { RegisterAuthDTO, RegisterOutputDTO } from './dto/register.dto';
import {
  ResetPassowrdDTO,
  ResetPasswordOutputDTO,
} from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly helplerService: HelperService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}
  @Post('register')
  async register(
    @Body() registerDto: RegisterAuthDTO, // : Promise<RegisterOutputDTO>
  ) {
    const collection = this.helplerService.messageCollectionGen();
    const emailUsed = !!(await this.authService.findByEmail(registerDto.email));
    const usernameUsed = !!(await this.authService.findByUsername(
      registerDto.username,
    ));

    collection.setFlagMessage(emailUsed, 'ایمیل قبلا استفاده شده');
    collection.setFlagMessage(usernameUsed, 'نام کاربری قبلا استفاده شده');

    if (collection.messages.length) {
      throw new BadRequestException(collection.messages);
    }

    const user = await this.authService.createAccount(registerDto);
    const activeToken = this.jwtService.sign({
      code: user.verificationCode,
    });

    await this.mailService.sendCreateAccountConfimation(user, activeToken);

    const res = new RegisterOutputDTO(user.id, user.registeredToken);
    return {
      ...res,
      activeToken,
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDTO): Promise<LoginOutputDTO> {
    const user = await this.authService.loginAccount(loginDto);

    if (!user.verifyed) {
      return new LoginOutputDTO(['لطفا حساب کاربری خود را تایید کنید'], false);
    }
    const payload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);
    return new LoginOutputDTO(accessToken, true);
  }

  @Get('forget-password/:username')
  async forgetPassowrd(@Param('username') username: string) {
    let user = await this.authService.findByUsername(username);
    user = user ?? (await this.authService.findByEmail(username));

    let resetToken;

    if (user) {
      const payload = {
        userId: user.id,
        junk: user.password.slice(5, 10),
      };
      resetToken = this.jwtService.sign(payload);
      //send email
      await this.mailService.sendResetPassword(user, resetToken);
    }

    return new ForgetPasswrdOutputDTO(true, [
      `email send to user by username ${username}`,
    ]);
  }

  @Post('reset-password/:resetToken')
  //Token is Valid
  async resetPassowrd(
    @Param('resetToken') resetToken: string,
    @Body() resetPasswordDto: ResetPassowrdDTO,
  ) {
    const decoded: any = this.jwtService.verify(resetToken);
    const user = await this.authService.getUserAuthById(decoded['userId']);
    const junk = user.password.slice(5, 10);

    if (junk !== decoded['junk']) {
      throw new BadRequestException(
        'لینک تغییر پسورد نامعتبر میباشد، لطفا بار دیگر این لینک را دریافت کنید',
      );
    }
    const res = await this.authService.resetUserPassword(
      user.id,
      resetPasswordDto.password,
    );

    const collection = this.helplerService.messageCollectionGen();

    collection.setMessage(
      res.ok ? 'رمز عبور با موفقیت تغییر یافت' : 'رمز عبور تغییر نکرد',
    );

    return new ResetPasswordOutputDTO(res.ok, collection.messages);
  }
  @Put('register/profile/:registeredToken')
  editRegisteredProfileUser(
    @Param('registeredToken') registeredToken: string,
    @Body() editRegisteredProfile: EditRegisteredProfile,
  ) {
    const decoded = this.jwtService.verify(registeredToken);
    const userId: string = decoded['userId'];
    return this.authService.editPofileRegistered(
      userId,
      registeredToken,
      editRegisteredProfile,
    );
  }

  @Get('active-account/:activeToken')
  async verifyAccount(@Param('activeToken') activeToken: string) {
    const decoded = this.jwtService.verify(activeToken);
    const verificationCode: string = decoded['code'];
    if (!verificationCode) throw new BadRequestException('لینک نامتعبر میباشد');

    const user = await this.authService.verifiedAccount(verificationCode);
    const payload = {
      userId: user.id,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      ok: true,
      accessToken,
    };
  }
  @Get('active-code/:username')
  async genVerificationCode(@Param('username') username: string) {
    let user: User = await this.authService.findByUsername(username);
    user = user ?? (await this.authService.findByEmail(username));
    if (!user) {
      return {
        ok: true,
      };
    }
    if (user.verifyed) {
      return {
        ok: true,
        activated: true,
      };
    }
    const code = await this.authService.generateVarificationsCode(user);

    const activeToken = this.jwtService.sign({
      code,
    });

    await this.mailService.sendCreateAccountConfimation(user, activeToken);
    return {
      ok: true,
      activated: false,
    };
  }
}
