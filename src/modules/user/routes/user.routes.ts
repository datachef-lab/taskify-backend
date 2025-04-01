import { Router } from "express";
import { createUser } from "../controllers/user.controller";

const userRouter = Router();

// Route to create a new user
userRouter.post("/", createUser);

// // Route to get a user by ID
// userRouter.get("/:id", getUserById);

// // Route to update a user by ID
// userRouter.put("/:id", updateUser);

// // Route to delete a user by ID
// userRouter.delete("/:id", deleteUser);

export default userRouter;
