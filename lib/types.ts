export type TaskStatus = "pending" | "completed" | "failed";
export type NotificationChannel = "email" | "line";

export interface User {
  id: string;
  display_name: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  deadline_at: string;
  penalty_amount: number;
  donation_destination: string;
  donate_url: string | null;
  status: TaskStatus;
  completed_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Failure {
  id: string;
  created_at: string;
  title: string;
  description: string;
  donation_amount: number;
  user_name: string;
  task_id: string | null;
  user_id: string | null;
  donation_destination: string | null;
  donate_url: string | null;
  consecutive_fail_count?: number;
}

export interface TimelinePost {
  id: string;
  task_id: string;
  user_id: string;
  display_name: string;
  task_title: string;
  penalty_amount: number;
  donation_destination: string;
  body: string;
  created_at: string;
}

export interface NotificationTarget {
  id: string;
  task_id: string;
  type: NotificationChannel;
  label: string;
  destination: string;
  notified_at: string | null;
  created_at: string;
}

export interface ConfessionPost {
  id: string;
  user_id: string | null;
  display_name: string;
  body: string;
  parent_id: string | null;
  comfort_count: number;
  created_at: string;
  replies?: ConfessionPost[];
}

export interface CreateTaskPayload {
  userId?: string;
  displayName: string;
  title: string;
  deadlineAt: string;
  penaltyAmount: number;
  donationDestination: string;
  donateUrl?: string;
  notifyName: string;
  notifyEmail: string;
}

export interface TaskWithMeta extends Task {
  consecutive_fail_count?: number;
}
