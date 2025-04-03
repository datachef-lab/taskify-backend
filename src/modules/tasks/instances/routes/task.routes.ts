import express from "express";
import * as TaskController from "../../controllers/task.controller";
import { authenticateJWT } from "../../../../middlewares/auth";
import { logActivityMiddleware } from "../../../../utils/activity-logger";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

/**
 * @route POST /api/tasks
 * @description Create a new task
 * @access Authenticated
 *
 * Note: This route uses direct activity logging in the controller
 */
router.post("/", TaskController.createTask);

/**
 * @route GET /api/tasks/:id
 * @description Get a task by ID
 * @access Authenticated
 *
 * Note: This route uses middleware for activity logging
 */
router.get(
    "/:id",
    logActivityMiddleware({
        entityType: "TASK",
        getEntityId: (req) => parseInt(req.params.id),
    }),
    TaskController.getTaskById
);

/**
 * @route PUT /api/tasks/:id
 * @description Update a task
 * @access Authenticated
 *
 * Note: This route uses direct activity logging in the controller
 */
router.put("/:id", TaskController.updateTask);

/**
 * @route DELETE /api/tasks/:id
 * @description Delete a task
 * @access Authenticated
 *
 * Note: This route uses direct activity logging in the controller
 */
router.delete("/:id", TaskController.deleteTask);

export default router;
