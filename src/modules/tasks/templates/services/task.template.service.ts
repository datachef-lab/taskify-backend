import { db } from "../../../../db";
import { taskTemplateModel } from "../models/taskTemplate.model";
import { eq } from "drizzle-orm";

export interface TaskTemplateData {
    name: string;
    description?: string;
}

// Service to create a new task template
export const createTaskTemplateService = async (data: TaskTemplateData) => {
    const [newTaskTemplate] = await db.insert(taskTemplateModel).values(data).returning();
    return newTaskTemplate;
};

// Service to fetch all task templates
export const getAllTaskTemplatesService = async () => {
    const taskTemplates = await db.select().from(taskTemplateModel);
    return taskTemplates;
};

// Service to fetch a task template by ID
export const getTaskTemplateByIdService = async (id: number) => {
    const [taskTemplate] = await db.select().from(taskTemplateModel).where(eq(taskTemplateModel.id, id));
    return taskTemplate;
};

// Service to update a task template by ID
export const updateTaskTemplateService = async (id: number, data: TaskTemplateData) => {
    const [updatedTaskTemplate] = await db
        .update(taskTemplateModel)
        .set(data)
        .where(eq(taskTemplateModel.id, id))
        .returning();
    return updatedTaskTemplate;
};

// Service to delete a task template by ID
export const deleteTaskTemplateService = async (id: number) => {
    const [deletedTaskTemplate] = await db.delete(taskTemplateModel).where(eq(taskTemplateModel.id, id)).returning();
    return deletedTaskTemplate;
};
