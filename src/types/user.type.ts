import { User } from "../modules/user/models/user.model";
import { UserDepartment } from "../modules/user/models/userDepartment.model";
import { Role } from "../modules/user/models/role.model";
import { Permission } from "../modules/user/models/permission.model";

export interface RoleDto extends Role {
    permissions: Permission[];
}

export interface UserDepartmentDto extends UserDepartment {
    roles: RoleDto[];
}

export interface UserDto extends User {
    departments: UserDepartmentDto[];
}
