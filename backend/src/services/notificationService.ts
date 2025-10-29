import {
  sendNewTaskNotification,
  sendPasswordChangeNotification
} from "./whatsappService.js";
import {
  sendTaskAssignmentEmail,
  sendPasswordChangeEmail
} from "./emailService.js";

import type { AssetNotificationPayload, Contact, TaskNotificationPayload } from "./types.js";

const logNotificationErrors = (results: PromiseSettledResult<void>[], context: string): void => {
  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(`Failed to send ${context}`, result.reason);
    }
  });
};

export const notifyTaskAssigned = async (
  handler: Contact,
  creator: Contact,
  task: TaskNotificationPayload
): Promise<void> => {
  const results = await Promise.allSettled([
    sendNewTaskNotification(handler, creator, task),
    sendTaskAssignmentEmail(handler, creator, task)
  ]);

  logNotificationErrors(results, "task notification");
};

export const notifyPasswordChanged = async (
  responsible: Contact,
  changer: Contact,
  asset: AssetNotificationPayload
): Promise<void> => {
  const results = await Promise.allSettled([
    sendPasswordChangeNotification(responsible, changer, asset),
    sendPasswordChangeEmail(responsible, changer, asset)
  ]);

  logNotificationErrors(results, "password change notification");
};
