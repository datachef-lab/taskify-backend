import express from "express";
import * as AnalyticsController from "../controllers/analytics.controller";
import { authenticateJWT, checkRole } from "../../../middlewares/auth";

const router = express.Router();

/**
 * @route GET /api/analytics/activities
 * @description Get user activities (Admin only)
 * @access Admin
 * @query userId - Filter by user ID
 * @query actionType - Filter by action type (CREATE, UPDATE, DELETE, etc.)
 * @query entityType - Filter by entity type (TASK, USER, PROJECT, etc.)
 * @query entityId - Filter by specific entity ID
 * @query startDate - Filter by start date
 * @query endDate - Filter by end date
 * @query limit - Limit results (default: 50, max: 100)
 * @query page - Page number for pagination (default: 1)
 */
router.get("/activities", authenticateJWT, checkRole(["admin"]), AnalyticsController.getUserActivities);

/**
 * @route GET /api/analytics/statistics
 * @description Get statistics with filtering options
 * @access Admin
 */
router.get("/statistics", authenticateJWT, checkRole(["admin"]), AnalyticsController.getStatistics);

/**
 * @route GET /api/analytics/statistics/:statisticType
 * @description Get latest statistic of a specific type
 * @access Admin
 */
router.get("/statistics/:statisticType", authenticateJWT, checkRole(["admin"]), AnalyticsController.getLatestStatistic);

/**
 * @route GET /api/analytics/performance
 * @description Get performance metrics with filtering options
 * @access Admin
 */
router.get("/performance", authenticateJWT, checkRole(["admin"]), AnalyticsController.getPerformanceMetrics);

/**
 * @route GET /api/analytics/performance/average/:operation
 * @description Get average duration for a specific operation
 * @access Admin
 */
router.get(
    "/performance/average/:operation",
    authenticateJWT,
    checkRole(["admin"]),
    AnalyticsController.getAverageDuration
);

/**
 * @route GET /api/analytics/performance/slowest
 * @description Get the slowest operations
 * @access Admin
 */
// router.get(
//     "/performance/slowest",
//     authenticateJWT,
//     checkRole(["admin"]),
//     AnalyticsController.getSlowestOperations
// );

/**
 * @route GET /api/analytics/jobs
 * @description Get list of all scheduled jobs
 * @access Admin
 */
router.get("/jobs", authenticateJWT, checkRole(["admin"]), AnalyticsController.getScheduledJobs);

/**
 * @route POST /api/analytics/jobs/:jobName/run
 * @description Run a specific job manually
 * @access Admin
 */
router.post("/jobs/:jobName/run", authenticateJWT, checkRole(["admin"]), AnalyticsController.runStatisticsJob);

export default router;
