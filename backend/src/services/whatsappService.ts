import fetch from "node-fetch";

import { env } from "../config/env.js";

import type {
  AssetNotificationPayload,
  Contact,
  TaskNotificationPayload
} from "./types.js";

const CALLMEBOT_ENDPOINT = "https://api.callmebot.com/whatsapp.php";

const sendWhatsAppMessage = async (phone: string, message: string): Promise<void> => {
  const params = new URLSearchParams({
    phone,
    text: message,
    apikey: env.CALLMEBOT_API_KEY
  });

  const response = await fetch(`${CALLMEBOT_ENDPOINT}?${params.toString()}`, {
    method: "GET"
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`CallMeBot error: ${response.status} ${errorBody}`);
  }
};

export const sendNewTaskNotification = async (
  handler: Contact,
  creator: Contact,
  task: TaskNotificationPayload
): Promise<void> => {
  const message = `New Task: ${task.title}. Assigned by: ${creator.name}. Details: ${task.description}`;
  await sendWhatsAppMessage(handler.phone, message);
};

export const sendPasswordChangeNotification = async (
  responsible: Contact,
  changer: Contact,
  asset: AssetNotificationPayload
): Promise<void> => {
  const message = `Security Alert: The password for ${asset.url} (${asset.username}) was just changed by ${changer.name}.`;
  await sendWhatsAppMessage(responsible.phone, message);
};
