import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import createPaymentIntentRoute from "./routes/payment/create-payment-intent";
import confirmPaymentRoute from "./routes/payment/confirm-payment";
import webhookRoute from "./routes/payment/webhook";

// Auth routes
import { loginProcedure } from "./routes/auth/login";
import { logoutProcedure } from "./routes/auth/logout";
import { verifyProcedure } from "./routes/auth/verify";

// User management routes
import { listUsersProcedure } from "./routes/users/list";
import { getUserProcedure } from "./routes/users/get";
import { updateStatusProcedure } from "./routes/users/update-status";
import { sendMessageProcedure } from "./routes/users/send-message";
import { exportUsersProcedure } from "./routes/users/export";

// Content management routes
import { pendingContentProcedure } from "./routes/content/pending";
import { reviewContentProcedure } from "./routes/content/review";
import { batchActionProcedure } from "./routes/content/batch-action";

// Reports routes
import { listReportsProcedure } from "./routes/reports/list";
import { updateReportStatusProcedure } from "./routes/reports/update-status";

// Analytics routes
import overviewAnalyticsProcedure from "./routes/analytics/overview";
import { userAnalyticsProcedure } from "./routes/analytics/users";

// Sync opportunities routes
import { listSyncOpportunitiesProcedure } from "./routes/sync/list";
import { createSyncOpportunityProcedure } from "./routes/sync/create";
import { updateSyncOpportunityProcedure } from "./routes/sync/update";

// Support routes
import { listSupportTicketsProcedure } from "./routes/support/list";
import { updateTicketStatusProcedure } from "./routes/support/update-status";

// System routes
import { 
  getSystemSettingsProcedure, 
  updateSystemSettingsProcedure, 
  clearSystemCacheProcedure, 
  createBackupProcedure 
} from "./routes/system/settings";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  payment: createTRPCRouter({
    createPaymentIntent: createPaymentIntentRoute,
    confirmPayment: confirmPaymentRoute,
    webhook: webhookRoute,
  }),
  auth: createTRPCRouter({
    login: loginProcedure,
    logout: logoutProcedure,
    verify: verifyProcedure,
  }),
  users: createTRPCRouter({
    list: listUsersProcedure,
    get: getUserProcedure,
    updateStatus: updateStatusProcedure,
    sendMessage: sendMessageProcedure,
    export: exportUsersProcedure,
  }),
  content: createTRPCRouter({
    pending: pendingContentProcedure,
    review: reviewContentProcedure,
    batchAction: batchActionProcedure,
  }),
  reports: createTRPCRouter({
    list: listReportsProcedure,
    updateStatus: updateReportStatusProcedure,
  }),
  analytics: createTRPCRouter({
    overview: overviewAnalyticsProcedure,
    users: userAnalyticsProcedure,
  }),
  sync: createTRPCRouter({
    list: listSyncOpportunitiesProcedure,
    create: createSyncOpportunityProcedure,
    update: updateSyncOpportunityProcedure,
  }),
  support: createTRPCRouter({
    list: listSupportTicketsProcedure,
    updateStatus: updateTicketStatusProcedure,
  }),
  system: createTRPCRouter({
    getSettings: getSystemSettingsProcedure,
    updateSettings: updateSystemSettingsProcedure,
    clearCache: clearSystemCacheProcedure,
    createBackup: createBackupProcedure,
  }),
});

export type AppRouter = typeof appRouter;