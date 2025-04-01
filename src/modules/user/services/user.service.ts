import bcrypt from "bcryptjs";
import { db } from "../../../db";
import { userModel } from "../models/user.model";
import { UserDto } from "../../../types/user.type";

export const createUserService = async (userData: UserDto) => {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    // Create a new user
    const [newUser] = await db.insert(userModel).values(userData).returning();

    return newUser;
};
export const getUserByIdService = () => {};
export const updateUserService = () => {};
export const deleteUserService = () => {};
export const getAllUsersService = () => {};
export const getUserByEmailService = () => {};
