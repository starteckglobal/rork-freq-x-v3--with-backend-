import { adminProcedure } from '../../create-context';

export const verifyProcedure = adminProcedure
  .query(async ({ ctx }) => {
    return {
      user: ctx.adminUser,
      authenticated: true,
    };
  });

export default verifyProcedure;