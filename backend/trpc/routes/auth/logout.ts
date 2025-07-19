import { adminProcedure } from '../../create-context';

export const logoutProcedure = adminProcedure
  .mutation(async ({ ctx }) => {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    return {
      success: true,
      message: 'Logged out successfully',
    };
  });

export default logoutProcedure;