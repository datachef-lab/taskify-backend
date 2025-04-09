import { Router } from "express";
import {
    createTaskTemplate,
    deleteTaskTemplate,
    getAllTaskTemplates,
    getTaskTemplateById,
    updateTaskTemplate,
} from "../controllers/task.template.controller";
const taskTemplateRouter = Router();

taskTemplateRouter.post("/", createTaskTemplate); // Create a new task template

taskTemplateRouter.get("/", getAllTaskTemplates); // Get all task templates

taskTemplateRouter.get("/:id", getTaskTemplateById); // Get a task template by ID

taskTemplateRouter.put("/:id", updateTaskTemplate); // Update a task template by ID

taskTemplateRouter.delete("/:id", deleteTaskTemplate); // Delete a task template by ID

export default taskTemplateRouter;
