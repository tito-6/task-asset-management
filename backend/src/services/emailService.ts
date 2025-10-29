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

const createEmailTemplate = (content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f7fa;
        }
        .email-container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .header p {
          margin: 8px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          color: #333;
          line-height: 1.8;
          margin: 0 0 16px 0;
        }
        .info-box {
          background: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .info-box h3 {
          margin: 0 0 12px 0;
          color: #667eea;
          font-size: 16px;
          font-weight: 600;
        }
        .info-box p {
          margin: 0;
          color: #555;
          font-size: 14px;
        }
        .description {
          background: #ffffff;
          border: 1px solid #e0e4e8;
          padding: 16px;
          margin: 16px 0;
          border-radius: 8px;
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e0e4e8;
        }
        .footer p {
          margin: 0;
          color: #888;
          font-size: 13px;
        }
        .signature {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #e0e4e8;
          color: #667eea;
          font-weight: 600;
          font-size: 15px;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        ${content}
        <div class="footer">
          <p class="signature">${env.EMAIL_SENDER_NAME}</p>
          <p style="margin-top: 12px;">This is an automated notification from your task management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const sendEmail = async (to: Contact, subject: string, htmlContent: string, textContent: string): Promise<void> => {
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
    html: createEmailTemplate(htmlContent),
    text: textContent
  });
};

export const sendTaskAssignmentEmail = async (
  handler: Contact,
  creator: Contact,
  task: TaskNotificationPayload
): Promise<void> => {
  const subject = `🎯 New Task Assigned: ${task.title}`;
  
  const htmlContent = `
    <div class="header">
      <h1>📋 New Task Assigned</h1>
      <p>You have a new task that requires your attention</p>
    </div>
    <div class="content">
      <p>Hi <strong>${handler.name}</strong>,</p>
      <p><strong>${creator.name}</strong> has assigned a new task to you.</p>
      
      <div class="info-box">
        <h3>📌 Task Title</h3>
        <p>${task.title}</p>
      </div>
      
      <div class="info-box">
        <h3>📝 Description</h3>
        <div class="description">${task.description}</div>
      </div>
      
      <p style="margin-top: 24px;">Please review this task and take the necessary actions.</p>
    </div>
  `;
  
  const textContent = `New Task Assigned: ${task.title}\n\nHi ${handler.name},\n\n${creator.name} has assigned a new task to you.\n\nTitle: ${task.title}\nDescription: ${task.description}\n\n${env.EMAIL_SENDER_NAME}`;
  
  await sendEmail(handler, subject, htmlContent, textContent);
};

export const sendPasswordChangeEmail = async (
  responsible: Contact,
  changer: Contact,
  asset: AssetNotificationPayload
): Promise<void> => {
  const subject = `🔐 Security Alert: Password Updated for ${asset.url}`;
  
  const htmlContent = `
    <div class="header">
      <h1>🔐 Security Alert</h1>
      <p>A password has been changed for one of your assets</p>
    </div>
    <div class="content">
      <p>Hi <strong>${responsible.name}</strong>,</p>
      <p><strong>${changer.name}</strong> has updated the password for one of your managed assets.</p>
      
      <div class="info-box">
        <h3>🌐 Asset URL</h3>
        <p>${asset.url}</p>
      </div>
      
      <div class="info-box">
        <h3>👤 Username</h3>
        <p>${asset.username}</p>
      </div>
      
      <div class="info-box">
        <h3>🔧 Changed By</h3>
        <p>${changer.name}</p>
      </div>
      
      <p style="margin-top: 24px; color: #d9534f; font-weight: 600;">⚠️ If you did not expect this change, please review immediately and contact your administrator.</p>
    </div>
  `;
  
  const textContent = `Security Alert: Password Updated\n\nHi ${responsible.name},\n\n${changer.name} updated the password for ${asset.url}.\nUsername: ${asset.username}\n\nIf you did not expect this change, please review immediately.\n\n${env.EMAIL_SENDER_NAME}`;
  
  await sendEmail(responsible, subject, htmlContent, textContent);
};
