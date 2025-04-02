import bcrypt from "bcryptjs";
import { db } from "../../../db";
import { userModel } from "../models/user.model";
import { UserDto } from "../../../types/user.type";
import { eq } from "drizzle-orm";

/**
 * Service to create a new user.
 * Hashes the password before storing it in the database.
 * Optionally checks if the user already exists.
 * @param userData - The user data to create a new user.
 * @param checkExisting - Whether to check for existing users.
 * @returns The created user without the password field, or null if the user already exists.
 * @throws Error if the user creation fails.
 */
export const createUserService = async (userData: UserDto, checkExisting = false) => {
    try {
        if (checkExisting) {
            const [existingUser] = await db.select().from(userModel).where(eq(userModel.email, userData.email));
            if (existingUser) {
                return null; // User already exists
            }
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;

        // Create a new user
        const [newUser] = await db.insert(userModel).values(userData).returning();
        const { password, ...userWithoutPassword } = newUser;

        return userWithoutPassword;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Error creating user: ${errorMessage}`);
    }
};

/**
 * Service to fetch all users.
 * Excludes the password field from the returned users.
 * @returns An array of all users without the password field.
 * @throws Error if fetching users fails.
 */
export const findAllUsers = async () => {
    try {
        const users = await db.select().from(userModel);
        return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Error fetching all users: ${errorMessage}`);
    }
};

/**
 * Service to fetch a user by ID.
 * Excludes the password field from the returned user.
 * @param userId - The ID of the user to fetch.
 * @returns The user without the password field.
 * @throws Error if the user is not found or fetching fails.
 */
export const getUserByIdService = async (userId: number) => {
    try {
        const [foundUser] = await db.select().from(userModel).where(eq(userModel.id, userId));
        if (!foundUser) {
            throw new Error(`User with ID ${userId} not found`);
        }
        const { password, ...userWithoutPassword } = foundUser;
        return userWithoutPassword;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Error fetching user by ID: ${errorMessage}`);
    }
};

/**
 * Service to update a user by ID.
 * Excludes the password field from the returned updated user.
 * @param userId - The ID of the user to update.
 * @param userData - The updated user data.
 * @returns The updated user without the password field.
 * @throws Error if the user is not found or updating fails.
 */
export const updateUserService = async (userId: number, userData: Partial<UserDto>) => {
    try {
        const [updatedUser] = await db
            .update(userModel)
            .set({ ...userData })
            .where(eq(userModel.id, userId))
            .returning();

        if (!updatedUser) {
            throw new Error(`User with ID ${userId} not found`);
        }

        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Error updating user: ${errorMessage}`);
    }
};

/**
 * Service to disable (soft delete) a user by ID.
 * Marks the user as disabled instead of permanently deleting them.
 * Excludes the password field from the returned user.
 * @param userId - The ID of the user to disable.
 * @returns The disabled user without the password field.
 * @throws Error if the user is not found or disabling fails.
 */
export const deleteUserService = async (userId: number) => {
    try {
        const [updatedUser] = await db
            .update(userModel)
            .set({ disabled: true })
            .where(eq(userModel.id, userId))
            .returning();

        if (!updatedUser) {
            throw new Error(`User with ID ${userId} not found`);
        }

        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Error disabling user: ${errorMessage}`);
    }
};

/**
 * Service to fetch a user by email.
 * Excludes the password field from the returned user.
 * @param email - The email of the user to fetch.
 * @returns The user without the password field.
 * @throws Error if the user is not found or fetching fails.
 */
export const getUserByEmailService = async (email: string) => {
    try {
        const [user] = await db.select().from(userModel).where(eq(userModel.email, email));
        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        throw new Error(`Error fetching user by email: ${errorMessage}`);
    }
};
