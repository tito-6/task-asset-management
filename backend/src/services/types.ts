export type Contact = {
  name: string;
  phone: string;
  email: string;
  whatsappApiKey?: string;
};

export type TaskNotificationPayload = {
  title: string;
  description: string;
};

export type AssetNotificationPayload = {
  url: string;
  username: string;
};
