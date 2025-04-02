import bcrypt from "bcryptjs";
import { db } from "../../../db";
import { userModel } from "../models/user.model";
import { UserDto } from "../../../types/user.type";
import { eq } from "drizzle-orm";

export const createUserService = async (userData: UserDto) => {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    // Create a new user
    const [newUser] = await db.insert(userModel).values(userData).returning();
    const { password, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
};

export const findAllUsers = async () => {
    const users = await db.select().from(userModel);

    return users;
};

export const getUserByIdService = async (userId: number) => {
    const [foundUser] = await db.select().from(userModel).where(eq(userModel.id, userId));
    const { password, ...userWithoutPassword } = foundUser;

    return userWithoutPassword;
};

export const updateUserService = async (userId: number, userData: UserDto) => {
    const [updatedUser] = await db
        .update(userModel)
        .set({ ...userData })
        .where(eq(userModel.id, userId))
        .returning();
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
};

export const deleteUserService = async (userId: number) => {
    // deleting user from db
    // const [deletedUser] = await db.delete(userModel).where(eq(userModel.id, userId)).returning();

    // return deletedUser;

    // just disabling user
    const [updatedUser] = await db
        .update(userModel)
        .set({ disabled: true })
        .where(eq(userModel.id, userId))
        .returning();
    const { password, ...userWithoutPassword } = updatedUser;

    return userWithoutPassword;
};

export const getUserByEmailService = async (email: string) => {
    const [user] = await db.select().from(userModel).where(eq(userModel.email, email));
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
};
