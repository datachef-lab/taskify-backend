import { Request, Response } from "express";
import { logUserActivity } from "../../../utils/activity-logger";
import { logger } from "../../../utils/logger";

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email?: string;
        role?: string;
        [key: string]: any;
    };
}

/**
 * Create a new task
 */
export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        // Check if user is authenticated
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
            return;
        }

        const { title, description, deadline, priority, assignedTo } = req.body;

        // Validate required fields
        if (!title) {
            res.status(400).json({
                success: false,
                message: "Title is required",
            });
            return;
        }

        // In a real app, you would create a task in the database here
        // For this example, we'll simulate creating a task with a fake ID
        const newTaskId = Math.floor(Math.random() * 1000) + 1;

        // Simulate task creation
        const newTask = {
            id: newTaskId,
            title,
            description,
            deadline,
            priority,
            assignedTo,
            createdBy: req.user.id,
            createdAt: new Date(),
            status: "PENDING",
        };

        // Log the activity - Direct approach using the utility function
        await logUserActivity(
            req.user.id,
            "CREATE",
            "TASK",
            newTaskId,
            `Created new task: ${title}`,
            {
                taskName: title,
                priority,
                deadline,
            },
            req.ip
        );

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: newTask,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error creating task: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "TaskController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: errorMessage,
        });
    }
}

/**
 * Get a task by ID
 */
export async function getTaskById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        // Check if user is authenticated
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
            return;
        }

        const taskId = parseInt(req.params.id);

        if (isNaN(taskId)) {
            res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
            return;
        }

        // In a real app, you would fetch the task from the database
        // For this example, we'll simulate finding a task
        const task = {
            id: taskId,
            title: `Task ${taskId}`,
            description: "This is a simulated task",
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            priority: "MEDIUM",
            assignedTo: req.user.id,
            createdBy: req.user.id,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            status: "PENDING",
        };

        // Activity logging is handled by middleware for this route

        res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error fetching task: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "TaskController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to fetch task",
            error: errorMessage,
        });
    }
}

/**
 * Update a task
 */
export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        // Check if user is authenticated
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
            return;
        }

        const taskId = parseInt(req.params.id);

        if (isNaN(taskId)) {
            res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
            return;
        }

        const { title, description, deadline, priority, status, assignedTo } = req.body;

        // In a real app, you would update the task in the database
        // For this example, we'll simulate updating a task
        const updatedTask = {
            id: taskId,
            title: title || `Task ${taskId}`,
            description: description || "This is a simulated task",
            deadline: deadline ? new Date(deadline) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            priority: priority || "MEDIUM",
            assignedTo: assignedTo || req.user.id,
            createdBy: req.user.id,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: status || "PENDING",
            updatedAt: new Date(),
        };

        // Log the activity - Direct approach
        await logUserActivity(
            req.user.id,
            "UPDATE",
            "TASK",
            taskId,
            `Updated task: ${updatedTask.title}`,
            {
                updatedFields: Object.keys(req.body),
                newStatus: updatedTask.status,
            },
            req.ip
        );

        res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: updatedTask,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error updating task: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "TaskController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: errorMessage,
        });
    }
}

/**
 * Delete a task
 */
export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
        // Check if user is authenticated
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
            return;
        }

        const taskId = parseInt(req.params.id);

        if (isNaN(taskId)) {
            res.status(400).json({
                success: false,
                message: "Invalid task ID",
            });
            return;
        }

        // In a real app, you would delete the task from the database
        // For this example, we'll just simulate task deletion

        // Log the activity - Direct approach
        await logUserActivity(
            req.user.id,
            "DELETE",
            "TASK",
            taskId,
            `Deleted task with ID: ${taskId}`,
            undefined,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
            `Error deleting task: ${errorMessage}`,
            error instanceof Error ? error : new Error(errorMessage),
            "TaskController"
        );
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: errorMessage,
        });
    }
}
