import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { publicProcedure } from '../../create-context';
import { ADMIN_USERS, JWT_SECRET } from '../../create-context';
import { TRPCError } from '@trpc/server';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const loginProcedure = publicProcedure
  .input(loginSchema)
  .mutation(async ({ input }) => {
    const { username, password } = input;
    
    const userData = ADMIN_USERS[username];
    if (!userData || userData.password !== password) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      { username, role: userData.user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: userData.user,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    };
  });

export default loginProcedure;