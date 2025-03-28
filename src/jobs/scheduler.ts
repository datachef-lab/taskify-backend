import { StatisticsGenerator } from "./statisticsGenerator";
import { logger } from "../utils/logger";
import cron from "node-cron";

/**
 * Job Scheduler
 *
 * Handles scheduling and running periodic jobs using node-cron
 */
export class JobScheduler {
    private static jobs: Map<string, cron.ScheduledTask> = new Map();

    /**
     * Initialize all scheduled jobs
     */
    static initializeJobs() {
        try {
            logger.info("Initializing scheduled jobs", "JobScheduler");

            // Schedule daily statistics generation at 1:00 AM
            this.scheduleJob(
                "dailyStatistics",
                "0 1 * * *", // Cron expression: At 01:00 AM every day
                async () => {
                    logger.info("Running daily statistics generation job", "JobScheduler");
                    await StatisticsGenerator.runAllJobs();
                }
            );

            // Add more scheduled jobs here as needed

            logger.success("All scheduled jobs initialized successfully", "JobScheduler");
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Failed to initialize jobs: ${error.message}`, error, "JobScheduler");
            } else {
                logger.error(
                    "Failed to initialize jobs: Unknown error",
                    error instanceof Error ? error : new Error(String(error)),
                    "JobScheduler"
                );
            }
        }
    }

    /**
     * Schedule a new job
     *
     * @param jobName Unique name for the job
     * @param cronExpression Cron expression for scheduling
     * @param callback Function to execute when the job runs
     */
    static scheduleJob(jobName: string, cronExpression: string, callback: () => Promise<void>) {
        try {
            // Validate the cron expression
            if (!cron.validate(cronExpression)) {
                throw new Error(`Invalid cron expression: ${cronExpression}`);
            }

            // Check if job with this name already exists
            if (this.jobs.has(jobName)) {
                this.stopJob(jobName);
            }

            // Schedule the new job
            const task = cron.schedule(cronExpression, async () => {
                try {
                    logger.info(`Running scheduled job: ${jobName}`, "JobScheduler");
                    await callback();
                    logger.info(`Completed scheduled job: ${jobName}`, "JobScheduler");
                } catch (error) {
                    if (error instanceof Error) {
                        logger.error(`Error in scheduled job ${jobName}: ${error.message}`, error, "JobScheduler");
                    } else {
                        logger.error(
                            `Error in scheduled job ${jobName}: ${String(error)}`,
                            new Error(String(error)),
                            "JobScheduler"
                        );
                    }
                }
            });

            // Store the job
            this.jobs.set(jobName, task);

            logger.info(`Scheduled job "${jobName}" with cron expression "${cronExpression}"`, "JobScheduler");

            return true;
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`Failed to schedule job ${jobName}: ${error.message}`, error, "JobScheduler");
            } else {
                logger.error(
                    `Failed to schedule job ${jobName}: ${String(error)}`,
                    new Error(String(error)),
                    "JobScheduler"
                );
            }
            return false;
        }
    }

    /**
     * Stop a running job
     *
     * @param jobName The name of the job to stop
     */
    static stopJob(jobName: string) {
        const job = this.jobs.get(jobName);

        if (job) {
            job.stop();
            this.jobs.delete(jobName);
            logger.info(`Stopped job: ${jobName}`, "JobScheduler");
            return true;
        }

        logger.warn(`Tried to stop non-existent job: ${jobName}`, "JobScheduler");
        return false;
    }

    /**
     * Stop all running jobs
     */
    static stopAllJobs() {
        for (const [jobName, job] of this.jobs.entries()) {
            job.stop();
            logger.info(`Stopped job: ${jobName}`, "JobScheduler");
        }

        this.jobs.clear();
        logger.info("Stopped all scheduled jobs", "JobScheduler");
    }

    /**
     * Run a job immediately, regardless of its schedule
     *
     * @param jobName The name of the job to run
     */
    static async runJobNow(jobName: string) {
        try {
            switch (jobName) {
                case "dailyStatistics":
                    logger.info("Running statistics generation job immediately", "JobScheduler");
                    await StatisticsGenerator.runAllJobs();
                    break;

                // Add more jobs here as needed

                default:
                    logger.warn(`Unknown job name: ${jobName}`, "JobScheduler");
                    return false;
            }

            logger.success(`Successfully ran job ${jobName}`, "JobScheduler");
            return true;
        } catch (error) {
            logger.error(
                `Failed to run job ${jobName}: ${error instanceof Error ? error.message : String(error)}`,
                error instanceof Error ? error : new Error(String(error)),
                "JobScheduler"
            );
            return false;
        }
    }

    /**
     * Get a list of all scheduled jobs
     */
    static getScheduledJobs() {
        return Array.from(this.jobs.keys());
    }
}
