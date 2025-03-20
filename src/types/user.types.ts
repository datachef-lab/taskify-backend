export interface UserDto {
    id?: number;
    name: string;
    email: string;
    password: string;
    phone?: string;
    profileImage?: string;
    disabled: boolean;
    departments: DepartmentDto[];
    isAdmin: boolean;
    viewTasks: ViewTaskDto[];
    createdAt: Date;
    updatedAt: Date;
}

export interface DepartmentDto {
    id: number;
    name: string;
    // Add other department fields as needed
}

export interface ViewTaskDto {
    id: number;
    taskType: string;
    userId: number;
    permissions: PermissionDto[];
}

export interface PermissionDto {
    id: number;
    // Add permission fields as needed
}
