import { Response } from "express";

export class ApiResponse {
    static success(res: Response, status: number, message: string, data?: unknown): void {
        res.status(status).json({
            success: true,
            message,
            data,
        });
    }

    static error(res: Response, error: Error): void {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }

    static notFound(res: Response, message: string): void {
        res.status(404).json({
            success: false,
            message,
        });
    }

    static badRequest(res: Response, message: string): void {
        res.status(400).json({
            success: false,
            message,
        });
    }
}
