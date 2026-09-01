import {
  ExceptionItem,
  NotificationItem,
  AuditLogItem,
  RunHistoryItem,
  DimAgeBandItem,
  ReviewStatus,
  ChannelType
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Standard HTTP client helper with Authorization & JSON headers.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    // Example: Entra ID / OAuth Bearer Token header space
    // 'Authorization': `Bearer ${getToken()}`,
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API Error [${response.status}]: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  isConfigured: () => Boolean(API_BASE),

  // Exceptions & Queue
  getExceptions: async (): Promise<ExceptionItem[]> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<ExceptionItem[]>('/exceptions');
  },

  getExceptionById: async (id: string): Promise<ExceptionItem> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<ExceptionItem>(`/exceptions/${id}`);
  },

  // Decisions (Review_Status & Audit_Log write path)
  submitDecision: async (
    excId: string,
    decision: ReviewStatus,
    comment: string
  ): Promise<{ success: boolean; auditEntry: AuditLogItem }> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<{ success: boolean; auditEntry: AuditLogItem }>(`/exceptions/${excId}/decisions`, {
      method: 'POST',
      body: JSON.stringify({ decision, comment })
    });
  },

  // Notifications (Microsoft Graph API proxy)
  getNotifications: async (): Promise<NotificationItem[]> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<NotificationItem[]>('/notifications');
  },

  sendNotification: async (payload: {
    exception_id: string;
    channel: ChannelType;
    recipient: string;
    escalated?: boolean;
  }): Promise<NotificationItem> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<NotificationItem>('/notifications', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  resendNotification: async (notifId: string): Promise<NotificationItem> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<NotificationItem>(`/notifications/${notifId}/resend`, {
      method: 'POST'
    });
  },

  escalateNotification: async (notifId: string): Promise<NotificationItem> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<NotificationItem>(`/notifications/${notifId}/escalate`, {
      method: 'POST'
    });
  },

  // Audit Log
  getAuditLogs: async (): Promise<AuditLogItem[]> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<AuditLogItem[]>('/audit-logs');
  },

  // Pipeline Runs
  getRunHistory: async (): Promise<RunHistoryItem[]> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<RunHistoryItem[]>('/runs');
  },

  triggerManualRun: async (): Promise<RunHistoryItem> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<RunHistoryItem>('/runs/trigger', {
      method: 'POST'
    });
  },

  // Configuration Thresholds
  getDimAgeBand: async (): Promise<DimAgeBandItem[]> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<DimAgeBandItem[]>('/config/age-bands');
  },

  // Embedded Chatbot / Cortex Analyst API
  sendChatMessage: async (query: string): Promise<{ answer: string; source: string; url?: string }> => {
    if (!API_BASE) throw new Error('No API_BASE configured');
    return request<{ answer: string; source: string; url?: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  }
};
