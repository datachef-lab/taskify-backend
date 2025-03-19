import { Request, Response } from "express";
import { IUserService } from "../interfaces/user.interface";
import { UserService } from "../services/user.service";
import { ApiResponse } from "../../../utils/api-response";

export class UserController {
  private userService: IUserService;

  constructor() {
    this.userService = new UserService();
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Validate required fields
      const { email, password, ...otherData } = req.body;

      if (!email || !password) {
        return ApiResponse.badRequest(res, "Email and password are required");
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ApiResponse.badRequest(res, "Invalid email format");
      }

      // Password strength validation
      if (password.length < 8) {
        return ApiResponse.badRequest(
          res,
          "Password must be at least 8 characters long"
        );
      }

      const userData = {
        email,
        password, // Password will be hashed in the service layer
        ...otherData,
      };

      const user = await this.userService.createUser(userData);

      // Don't send password back in response
      const { password: _, ...userWithoutPassword } = user;
      ApiResponse.success(
        res,
        201,
        "User created successfully",
        userWithoutPassword
      );
    } catch (error) {
      if ((error as any).code === 11000) {
        // MongoDB duplicate key error
        return ApiResponse.error(res, "Email already exists");
      }
      return ApiResponse.error(res, "An error occurred");
    }
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      ApiResponse.success(res, 200, "Users retrieved successfully", users);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        return ApiResponse.notFound(res, "User not found");
      }
      ApiResponse.success(res, 200, "User retrieved successfully", user);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  //   async getUsersByDepartment(req: Request, res: Response): Promise<void> {
  //     try {
  //       const users = await this.userService.getUsersByDepartment(
  //         req.params.department
  //       );
  //       ApiResponse.success(res, 200, "Users retrieved successfully", users);
  //     } catch (error) {
  //       ApiResponse.error(res, error);
  //     }
  //   }

  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.getUserByEmail(req.params.email);
      if (!user) {
        return ApiResponse.notFound(res, "User not found");
      }
      ApiResponse.success(res, 200, "User retrieved successfully", user);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      if (!user) {
        return ApiResponse.notFound(res, "User not found");
      }
      ApiResponse.success(res, 200, "User updated successfully", user);
    } catch (error) {
      ApiResponse.error(res, error);
    }
  }
}
