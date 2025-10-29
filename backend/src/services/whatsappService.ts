import fetch from "node-fetch";

import type {
  AssetNotificationPayload,
  Contact,
  TaskNotificationPayload
} from "./types.js";

const CALLMEBOT_ENDPOINT = "https://api.callmebot.com/whatsapp.php";

const sendWhatsAppMessage = async (phone: string, message: string, apiKey: string): Promise<void> => {
  // Remove + prefix if present (CallMeBot expects phone without +)
  const cleanPhone = phone.replace(/^\+/, '');
  
  const params = new URLSearchParams({
    phone: cleanPhone,
    text: message,
    apikey: apiKey
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
  if (!handler.whatsappApiKey) {
    throw new Error(`WhatsApp API key not configured for user ${handler.name}`);
  }
  const message = `New Task: ${task.title}. Assigned by: ${creator.name}. Details: ${task.description}`;
  await sendWhatsAppMessage(handler.phone, message, handler.whatsappApiKey);
};

export const sendPasswordChangeNotification = async (
  responsible: Contact,
  changer: Contact,
  asset: AssetNotificationPayload
): Promise<void> => {
  if (!responsible.whatsappApiKey) {
    throw new Error(`WhatsApp API key not configured for user ${responsible.name}`);
  }
  const message = `Security Alert: The password for ${asset.url} (${asset.username}) was just changed by ${changer.name}.`;
  await sendWhatsAppMessage(responsible.phone, message, responsible.whatsappApiKey);
};
