import { Router } from "express";
import {
    createUser,
    deleteUser,
    getAllUsers,
    getUserByEmail,
    getUserById,
    updateUser,
} from "../controllers/user.controller";

const userRouter = Router();

/**
 * @route POST /api/users
 * @description Create a new user
 * @access Public
 */
userRouter.post("/", createUser);

/**
 * @route GET /api/users
 * @description Get all users
 * @access Public
 */
userRouter.get("/", getAllUsers);

/**
 * @route GET /api/users/:userId
 * @description Get a user by ID
 * @access Public
 */
userRouter.get("/:userId", getUserById);

/**
 * @route GET /api/users/email/:email
 * @description Get a user by email
 * @access Public
 */
userRouter.get("/email/:email", getUserByEmail);

/**
 * @route PUT /api/users/:userId
 * @description Update a user by ID
 * @access Public
 */
userRouter.put("/:userId", updateUser);

/**
 * @route DELETE /api/users/:userId
 * @description Delete (disable) a user by ID
 * @access Public
 */
userRouter.delete("/:userId", deleteUser);

export default userRouter;
