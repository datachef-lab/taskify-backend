import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

/**
 * Generate an access token.
 * @param payload - The payload to include in the token.
 * @returns The signed JWT access token.
 */
export const generateAccessToken = (payload: object): string => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

/**
 * Generate a refresh token.
 * @param payload - The payload to include in the token.
 * @returns The signed JWT refresh token.
 */
export const generateRefreshToken = (payload: object): string => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

/**
 * Verify an access token.
 * @param token - The token to verify.
 * @returns The decoded payload if valid.
 * @throws Error if the token is invalid or expired.
 */
export const verifyAccessToken = (token: string): object => {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (typeof decoded === "object" && decoded !== null) {
        return decoded;
    }
    throw new Error("Invalid token payload");
};

/**
 * Verify a refresh token.
 * @param token - The token to verify.
 * @returns The decoded payload if valid.
 * @throws Error if the token is invalid or expired.
 */
export const verifyRefreshToken = (token: string): object => {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    if (typeof decoded === "object" && decoded !== null) {
        return decoded;
    }
    throw new Error("Invalid token payload");
};
