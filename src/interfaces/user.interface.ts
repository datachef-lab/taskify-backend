export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  profileImage?: string | null;
  isAdmin?: boolean | null;
  disabled?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserService {
  createUser(userData: IUser): Promise<IUser>;
  getAllUsers(): Promise<IUser[]>;
  getUserById(id: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  updateUser(id: string, userData: Partial<IUser>): Promise<IUser | null>;
}
