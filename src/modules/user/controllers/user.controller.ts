import { Request, Response } from "express";
import { createUserService } from "../services/user.service";
import { ApiResponse } from "../../../utils/api-response";

// Controller to create a new user
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

// Controller to get a user by ID
// export const getUserById = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const user = await getUserByIdService(req.params.id);
//         if (!user) {
//             res.status(404).json({ success: false, message: "User not found" });
//             return;
//         }
//         res.status(200).json({ success: true, data: user });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// Controller to update a user by ID
// export const updateUser = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const updatedUser = await updateUserService(req.params.id, req.body);
//         if (!updatedUser) {
//             res.status(404).json({ success: false, message: "User not found" });
//             return;
//         }
//         res.status(200).json({ success: true, data: updatedUser });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// Controller to delete a user by ID
// export const deleteUser = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const deleted = await deleteUserService(req.params.id);
//         if (!deleted) {
//             res.status(404).json({ success: false, message: "User not found" });
//             return;
//         }
//         res.status(200).json({ success: true, message: "User deleted successfully" });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };
