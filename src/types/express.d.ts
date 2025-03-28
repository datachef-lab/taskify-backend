import { UserDto } from "./user.type";

// Extend Express Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            user?: UserDto;
        }
    }
}
