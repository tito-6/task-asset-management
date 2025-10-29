import nodemailer from "nodemailer";

import { env } from "../config/env.js";

import type {
  AssetNotificationPayload,
  Contact,
  TaskNotificationPayload
} from "./types.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_SENDER_ADDRESS,
    pass: env.EMAIL_APP_PASSWORD
  }
});

const formatSignature = (): string => `\n\n${env.EMAIL_SENDER_NAME}`;

const sendEmail = async (to: Contact, subject: string, body: string): Promise<void> => {
  await transporter.sendMail({
    from: {
      name: env.EMAIL_SENDER_NAME,
      address: env.EMAIL_SENDER_ADDRESS
    },
    to: {
      name: to.name,
      address: to.email
    },
    subject,
    text: `${body}${formatSignature()}`
  });
};

export const sendTaskAssignmentEmail = async (
  handler: Contact,
  creator: Contact,
  task: TaskNotificationPayload
): Promise<void> => {
  const subject = `New Task Assigned: ${task.title}`;
  const body = `Hi ${handler.name},\n\n${creator.name} has assigned a new task to you.\n\nTitle: ${task.title}\nDescription: ${task.description}`;
  await sendEmail(handler, subject, body);
};

export const sendPasswordChangeEmail = async (
  responsible: Contact,
  changer: Contact,
  asset: AssetNotificationPayload
): Promise<void> => {
  const subject = `Password Updated for ${asset.url}`;
  const body = `Hi ${responsible.name},\n\n${changer.name} updated the password for ${asset.url}.\nUsername: ${asset.username}\n\nIf you did not expect this change, please review immediately.`;
  await sendEmail(responsible, subject, body);
};
