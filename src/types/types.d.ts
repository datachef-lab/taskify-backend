declare namespace Express {
    export interface Request {
        user: { id: string; name: string; email: string }; // Replace with the actual structure of your user object
    }
    export interface Response {
        user: { id: number; name: string; email: string }; // Replace with the actual structure of your user object
    }
}
