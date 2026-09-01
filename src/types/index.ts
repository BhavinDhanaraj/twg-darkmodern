export type AgeBand = 'Terminal' | 'Aged' | 'Watch' | 'Healthy' | 'Data Issue';

export type OperatingModel =
  | 'Continuity Core'
  | 'Replen Tail'
  | 'Seasonal & Promo'
  | 'Indent & Special';

export type ReviewStatus = 'Accepted' | 'Modified' | 'Rejected' | 'Pending' | 'Closed' | 'N/A';

export type AckStatus = 'Acknowledged' | 'Delivered' | 'Not Acknowledged';

export type ChannelType = 'Teams' | 'Email';

export interface ExceptionItem {
  id: string;
  sku: string;
  desc: string;
  category: string;
  operating_model: OperatingModel | string;
  age_band: AgeBand;
  age_days: number;
  units: number;
  unit_cost: number;
  inv_value: number;
  priority_rank: number;
  recommended_action: string;
  rationale: string;
  review_status: ReviewStatus;
  reviewer: string;
  reviewer_email: string;
  hours_since_alert: number;
  notification_sent: boolean;
  dq_issue: boolean;
  dq_reason: string | null;
  comment: string;
}

export interface NotificationItem {
  id: string;
  exception_id: string;
  sku: string;
  recipient: string;
  recipient_email: string;
  channel: ChannelType;
  sent_time: string;
  ack_status: AckStatus;
  ack_time: string | null;
  escalated: boolean;
  resend_count: number;
}

export interface AuditLogItem {
  id: string;
  exception_id: string;
  sku: string;
  actor: string;
  action: ReviewStatus;
  comment: string;
  timestamp: string;
  previous_status: ReviewStatus;
}

export interface RunHistoryItem {
  run_id: string;
  timestamp: string;
  trigger: string;
  status: string;
  records_processed: number;
  exceptions_generated: number;
  data_issues: number;
  duration_sec: number;
}

export interface Reviewer {
  name: string;
  role: string;
  email: string;
}

export interface DimAgeBandItem {
  operating_model: string;
  age_band: AgeBand;
  days_lower: number;
  days_upper: number | null;
}

export interface SopKbItem {
  id: string;
  keywords: string[];
  answer: string;
  source: string;
}

export type NavKey =
  | 'workbench'
  | 'kanban'
  | 'queue'
  | 'notifications'
  | 'audit'
  | 'config';

export type RepresentationMode =
  | 'overview'
  | 'kanban'
  | 'matrix'
  | 'workbench'
  | 'timeline'
  | 'simulator'
  | 'representations';

export interface SimThresholds {
  [operating_model: string]: {
    watchDays: number;
    agedDays: number;
    terminalDays: number;
  };
}

export interface QueueFilters {
  om: string;
  band: string;
  status: string;
  search: string;
}

export interface NotificationFilters {
  ack: string;
  channel: string;
  search: string;
}

export interface AuditFilters {
  action: string;
  search: string;
}

export interface AnalyticsFilters {
  om: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  from: 'bot' | 'user' | 'bot-fallback';
  text: string;
  source?: string | null;
  url?: string | null;
}

export interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'warn' | 'danger' | '';
}
