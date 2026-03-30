import { BaseEntity } from './common';

export interface CreateNotification {
	userId: string;
	notificationType: string;
	message: string;
}


export interface NotificationResp extends BaseEntity {
	userId: string;
  notificationType: NotificationType;
 	message?: string;
 	readAt?: Date | null;
  unread:boolean;
}

export interface NotificationRead{
  readAt?: Date | null;
}

export interface NotificationFilters {
  limit?: number;
  page?: number;
  userId?:string;
  type?:string;
}

export type NotificationType = string;


