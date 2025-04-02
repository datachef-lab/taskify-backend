import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../../utils/jwt.utils";
import { db } from "../../../db";
import { userModel } from "../../user/models/user.model";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Define the TokenPayload type
interface TokenPayload {
    id: string;
    email: string;
}

/**
 * Authenticate a user and generate tokens.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns An object containing the access and refresh tokens.
 * @throws Error if authentication fails.
 */
export const authenticateUser = async (email: string, password: string) => {
    const [user] = await db.select().from(userModel).where(eq(userModel.email, email));
    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    // Store the refresh token in the database or in-memory store
    await db.update(userModel).set({ refreshToken }).where(eq(userModel.id, user.id));

    return { accessToken, refreshToken };
};

/**
 * Refresh the access token using a valid refresh token.
 * @param refreshToken - The refresh token.
 * @returns A new access token.
 * @throws Error if the refresh token is invalid or expired.
 */
export const refreshAccessToken = async (refreshToken: string) => {
    const payload = verifyRefreshToken(refreshToken) as TokenPayload;

    const [user] = await db
        .select()
        .from(userModel)
        .where(eq(userModel.id, Number(payload.id)));
    if (!user || user.refreshToken !== refreshToken) {
        throw new Error("Invalid refresh token");
    }
    if (!user || user.refreshToken !== refreshToken) {
        throw new Error("Invalid refresh token");
    }

    const newAccessToken = generateAccessToken({ id: user.id, email: user.email });
    return newAccessToken;
};
