import { Request, Response } from "express";
import {
    createTaskTemplateService,
    getAllTaskTemplatesService,
    getTaskTemplateByIdService,
    updateTaskTemplateService,
    deleteTaskTemplateService,
} from "../services/task.template.service";

// Create a new task template
export const createTaskTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        const newTaskTemplate = await createTaskTemplateService({ name, description });
        res.status(201).json({ success: true, data: newTaskTemplate, message: "Task template created successfully" });
    } catch (error) {
        const err = error as Error;
        console.error("Create task template error:", err.message);
        res.status(500).json({ success: false, message: "Error creating task template" });
    }
};

// Get all task templates
export const getAllTaskTemplates = async (_req: Request, res: Response): Promise<void> => {
    try {
        const taskTemplates = await getAllTaskTemplatesService();
        res.status(200).json({ success: true, data: taskTemplates, message: "Task templates fetched successfully" });
    } catch (error) {
        const err = error as Error;
        console.error("Fetching task templates error:", err.message);
        res.status(500).json({ success: false, message: "Error fetching task templates" });
    }
};

// Get a task template by ID
export const getTaskTemplateById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const taskTemplate = await getTaskTemplateByIdService(Number(id));

        if (!taskTemplate) {
            res.status(404).json({ success: false, message: "Task template not found" });
            return;
        }

        res.status(200).json({ success: true, data: taskTemplate, message: "Task template fetched successfully" });
    } catch (error) {
        const err = error as Error;
        console.error("Fetching task template error:", err.message);
        res.status(500).json({ success: false, message: "Error fetching task template" });
    }
};

// Update a task template by ID
export const updateTaskTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const updatedTaskTemplate = await updateTaskTemplateService(Number(id), { name, description });

        if (!updatedTaskTemplate) {
            res.status(404).json({ success: false, message: "Task template not found" });
            return;
        }

        res.status(200).json({
            success: true,
            data: updatedTaskTemplate,
            message: "Task template updated successfully",
        });
    } catch (error) {
        const err = error as Error;
        console.error("Updating task template error:", err.message);
        res.status(500).json({ success: false, message: "Error updating task template" });
    }
};

// Delete a task template by ID
export const deleteTaskTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deletedTaskTemplate = await deleteTaskTemplateService(Number(id));

        if (!deletedTaskTemplate) {
            res.status(404).json({ success: false, message: "Task template not found" });
            return;
        }

        res.status(200).json({
            success: true,
            data: deletedTaskTemplate,
            message: "Task template deleted successfully",
        });
    } catch (error) {
        const err = error as Error;
        console.error("Deleting task template error:", err.message);
        res.status(500).json({ success: false, message: "Error deleting task template" });
    }
};
