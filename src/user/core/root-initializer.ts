import { UserService } from '../user.service';

export function createRootAdmin(userService: UserService) {
  return (): Promise<any> => {
    return userService.createRootAdmin();
  };
}
