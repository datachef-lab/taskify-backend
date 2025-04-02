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

// Route to create a new user
userRouter.post("/", createUser);

// Route to create a new user
userRouter.get("/", getAllUsers);

// Route to get a user by ID
userRouter.get("/:userId", getUserById);

// Route to get a user by emailId
userRouter.get("/email/:email", getUserByEmail);

// // Route to update a user by ID
userRouter.put("/:userId", updateUser);

// // Route to delete a user by ID
userRouter.delete("/:id", deleteUser);

export default userRouter;
