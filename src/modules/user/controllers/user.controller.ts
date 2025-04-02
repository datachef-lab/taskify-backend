import { Request, Response } from "express";
import {
    createUserService,
    deleteUserService,
    findAllUsers,
    getUserByEmailService,
    getUserByIdService,
    updateUserService,
} from "../services/user.service";
import { ApiResponse } from "../../../utils/api-response";

/**
 * Controller to create a new user.
 * Validates the request body and creates a new user.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, phone } = req.body;
        const fields = ["name", "email", "password", "phone"];
        const missingFields = fields.filter((field) => !req.body[field]);

        if (missingFields.length > 0) {
            const message = `The following fields are required: ${missingFields.join(", ")}`;
            ApiResponse.badRequest(res, message);
            return;
        }

        const existingUser = await getUserByEmailService(email);
        if (existingUser) {
            const message = existingUser.email === email ? "Email already exists" : "Username already exists";
            ApiResponse.badRequest(res, message);
            return;
        }

        const userData = {
            name,
            email,
            password,
            phone,
        };

        const user = await createUserService(userData);
        ApiResponse.success(res, { status: 201, data: user });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred ceating user";
        ApiResponse.error(res, { message: errorMessage });
    }
};

/**
 * Controller to fetch all users.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await findAllUsers();

        return ApiResponse.success(res, { status: 200, data: users, message: "All users fetched successfully!" });
    } catch {
        return ApiResponse.error(res, { message: "An unexpected error occurred while fetching all users" });
    }
};

/**
 * Controller to fetch a user by ID.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            const message = `user is id not provided`;
            return ApiResponse.badRequest(res, message);
        }

        const user = await getUserByIdService(parseInt(userId));
        if (!user) {
            return ApiResponse.notFound(res, `User not found with userId: ${userId}`);
        }

        return ApiResponse.success(res, { data: user });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ success: false, message: errorMessage });
        return ApiResponse.error(res, { message: errorMessage });
    }
};

/**
 * Controller to fetch a user by email.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.params;
        if (!email) {
            const message = `user email is not provided`;
            return ApiResponse.badRequest(res, message);
        }

        const user = await getUserByEmailService(email);
        if (!user) {
            return ApiResponse.notFound(res, `User not found with email: ${email}`);
        }

        return ApiResponse.success(res, { data: user });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ success: false, message: errorMessage });
        return ApiResponse.error(res, { message: errorMessage });
    }
};

/**
 * Controller to update a user by ID.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        if (!userId) {
            const message = `user is id not provided`;
            return ApiResponse.badRequest(res, message);
        }

        const user = await getUserByIdService(parseInt(userId));
        if (!user) {
            return ApiResponse.notFound(res, `User not found with userId: ${userId}`);
        }

        const { ...userData } = req.body;

        const updatedUser = await updateUserService(parseInt(userId), userData);
        if (!updatedUser) {
            return ApiResponse.error(res, { status: 404, message: "User not found" });
        }
        return ApiResponse.success(res, { status: 200, data: updatedUser, message: "User updated successfully" });
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return ApiResponse.error(res, { status: 500, message: errorMessage });
    }
};

/**
 * Controller to delete (disable) a user by ID.
 * Marks the user as disabled instead of permanently deleting them.
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        if (!userId) {
            const message = `user is id not provided`;
            return ApiResponse.badRequest(res, message);
        }

        const user = await getUserByIdService(parseInt(userId));
        if (!user) {
            return ApiResponse.notFound(res, `User not found with userId: ${userId}`);
        }

        const deleted = await deleteUserService(parseInt(userId));
        if (!deleted) {
            return ApiResponse.notFound(res, "User not found");
        }

        return ApiResponse.success(res, { status: 200, message: "User deleted successfully" });
    } catch (error) {
        return ApiResponse.error(res, {
            message: `An unexpected error occurred while deleting the user: ${
                error instanceof Error ? error.message : "Unknown error"
            }`,
        });
    }
};
