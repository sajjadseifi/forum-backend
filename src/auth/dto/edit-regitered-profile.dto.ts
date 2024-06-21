import { PickType } from "@nestjs/mapped-types";
import { User } from "src/user/user.entity";

export class EditRegisteredProfile extends PickType(User,[
    'firstName',
    'lastName',
    'birthDate',
    'bio',
    'avatar',
]) {

}