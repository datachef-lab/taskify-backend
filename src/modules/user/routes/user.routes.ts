import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";
import { validateUser } from "../../../middlewares/validation";

const router = Router();
const userController = new UserController();

// Create user
router.post("/add", async (req: Request, res: Response): Promise<void> => {
  try {
    await userController.createUser(req, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get all users
router.get("/", async (req: Request, res: Response) => {
  try {
    await userController.getAllUsers(req, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    await userController.getUserById(req, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Get users by department
// router.get("/department/:department", async (req: Request, res: Response) => {
//   try {
//     await userController.getUsersByDepartment(req, res);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch users by department" });
//   }
// });

// Get user by email
router.get("/email/:email", async (req: Request, res: Response) => {
  try {
    await userController.getUserByEmail(req, res);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user by email" });
  }
});

// Update user
// router.put("/:id", validateUser, async (req: Request, res: Response) => {
//   try {
//     await userController.updateUser(req, res);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update user" });
//   }
// });

// Delete user
// router.delete("/:id", async (req: Request, res: Response) => {
//   try {
//     await userController.deleteUser(req, res);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to delete user" });
//   }
// });

export default router;
