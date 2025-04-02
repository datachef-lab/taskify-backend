declare global {
    namespace Express {
        interface Request {
            user?: { id: number; email: string }; // Add the `user` property
        }
    }
}
