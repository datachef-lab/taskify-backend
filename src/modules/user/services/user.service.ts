import { IUser, IUserService } from "../../../interfaces/user.interface";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export class UserService implements IUserService {
  async createUser(userData: IUser): Promise<IUser> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const dbUser = {
      ...userData,
      password: hashedPassword,
    };
    const [user] = await db.insert(users).values(dbUser).returning();
    return user;
  }

  async getAllUsers(): Promise<IUser[]> {
    return await db.select().from(users);
  }

  async getUserById(id: string): Promise<IUser | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)));
    return user || null;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async updateUser(
    id: string,
    userData: Partial<IUser>
  ): Promise<IUser | null> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, parseInt(id)))
      .returning();
    return user || null;
  }

  //   async getUsersByDepartment(department: string): Promise<IUser[]> {
  //     return await db
  //       .select()
  //       .from(users)
  //       .where(eq(users.department, department));
  //   }
}
