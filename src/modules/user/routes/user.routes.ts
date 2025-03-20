import express from "express";
import {
    createUser,
    // getAllUsers,
    // getUserByEmail,
    // getUserById
} from "../controllers/user.controller";

const router = express.Router();

/*
 * @route  POST /api/users/
 * @desc   Create a new user
 * @access Public (for now)
 *
 * @returns {User} - The newly created user
 */
router.post("/", createUser);

// To be implemented
// ---------------------------------------------------------
// // Get all users
// router.get("/", async (req: Request, res: Response) => {
//     try {
//         await getAllUsers(req, res);
//     } catch (error: unknown) {
//         console.log(error);
//         res.status(500).json({ error: "Failed to fetch users" });
//     }
// });

// // Get user by ID
// router.get("/:id", async (req: Request, res: Response) => {
//     try {
//         await getUserById(req, res);
//     } catch (error: unknown) {
//         console.log(error);
//         res.status(500).json({ error: "Failed to fetch user" });
//     }
// });

// // Get users by department
// // router.get("/department/:department", async (req: Request, res: Response) => {
// //   try {
// //     await userController.getUsersByDepartment(req, res);
// //   } catch (error) {
// //     res.status(500).json({ error: "Failed to fetch users by department" });
// //   }
// // });

// // Get user by email
// router.get("/email/:email", async (req: Request, res: Response) => {
//     try {
//         await getUserByEmail(req, res);
//     } catch (error: unknown) {
//         console.log(error);
//         res.status(500).json({ error: "Failed to fetch user by email" });
//     }
// });

// // Update user
// // router.put("/:id", validateUser, async (req: Request, res: Response) => {
// //   try {
// //     await userController.updateUser(req, res);
// //   } catch (error) {
// //     res.status(500).json({ error: "Failed to update user" });
// //   }
// // });

// // Delete user
// // router.delete("/:id", async (req: Request, res: Response) => {
// //   try {
// //     await userController.deleteUser(req, res);
// //   } catch (error) {
// //     res.status(500).json({ error: "Failed to delete user" });
// //   }
// // });

export default router;
