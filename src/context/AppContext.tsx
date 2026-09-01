import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ExceptionItem,
  NotificationItem,
  AuditLogItem,
  RunHistoryItem,
  Reviewer,
  DimAgeBandItem,
  SopKbItem,
  NavKey,
  QueueFilters,
  NotificationFilters,
  AuditFilters,
  AnalyticsFilters,
  ChatMessage,
  ToastItem,
  ReviewStatus,
  ChannelType,
  SimThresholds
} from '../types';
import {
  INITIAL_EXCEPTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOG,
  INITIAL_RUN_HISTORY,
  REVIEWERS,
  FINAL_APPROVER,
  DIM_AGE_BAND,
  SOP_KB
} from '../data/mockData';
import { api } from '../services/api';

interface AppContextType {
  exceptions: ExceptionItem[];
  notifications: NotificationItem[];
  auditLog: AuditLogItem[];
  runHistory: RunHistoryItem[];
  reviewers: Reviewer[];
  finalApprover: Reviewer;
  dimAgeBand: DimAgeBandItem[];
  sopKb: SopKbItem[];
  activeNav: NavKey;
  drawerExcId: string | null;
  queueFilter: QueueFilters;
  notifFilter: NotificationFilters;
  auditFilter: AuditFilters;
  analyticsFilter: AnalyticsFilters;
  chatOpen: boolean;
  mobileMenuOpen: boolean;
  chatMessages: ChatMessage[];
  chatTyping: boolean;
  toasts: ToastItem[];
  loading: boolean;
  apiConnected: boolean;
  refreshData: () => Promise<void>;
  navigate: (key: NavKey) => void;
  openDrawer: (id: string) => void;
  closeDrawer: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  submitDecision: (excId: string, decision: ReviewStatus, comment: string) => Promise<void>;
  sendNotification: (excId: string, channel?: ChannelType, recipientName?: string, isEscalation?: boolean) => Promise<void>;
  resendNotification: (notifId: string) => Promise<void>;
  escalateNotification: (notifId: string) => Promise<void>;
  triggerManualRun: () => Promise<void>;
  addToast: (message: string, type?: 'success' | 'warn' | 'danger' | '') => void;
  toggleChat: () => void;
  sendChatMessage: (text?: string) => Promise<void>;
  setQueueFilter: (key: keyof QueueFilters, val: string) => void;
  clearQueueFilters: () => void;
  setNotifFilter: (key: keyof NotificationFilters, val: string) => void;
  clearNotifFilters: () => void;
  setAuditFilter: (key: keyof AuditFilters, val: string) => void;
  clearAuditFilters: () => void;
  setAnalyticsFilter: (key: keyof AnalyticsFilters, val: string) => void;
  clearAnalyticsFilters: () => void;
  batchSubmitDecisions: (excIds: string[], decision: ReviewStatus, comment: string) => Promise<void>;
  batchSendNotifications: (excIds: string[], channel?: ChannelType) => Promise<void>;
  simThresholds: SimThresholds;
  setSimThresholds: React.Dispatch<React.SetStateAction<SimThresholds>>;
  resetSimThresholds: () => void;
  applySimulatedThresholds: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_SIM_THRESHOLDS: SimThresholds = {
  'Continuity Core': { watchDays: 91, agedDays: 181, terminalDays: 361 },
  'Replen Tail': { watchDays: 181, agedDays: 361, terminalDays: 541 },
  'Seasonal & Promo': { watchDays: 61, agedDays: 121, terminalDays: 241 },
  'Indent & Special': { watchDays: 121, agedDays: 241, terminalDays: 451 },
};

const CHAT_GREETING = "Hi, I'm the Exception Assistant. Ask me about Age Band thresholds, review/approval rules, escalation, notification SLAs, or anything in the Stock Ageing SOP — and I'll flag when something needs an external agent search instead.";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(INITIAL_EXCEPTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [auditLog, setAuditLog] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOG);
  const [runHistory, setRunHistory] = useState<RunHistoryItem[]>(INITIAL_RUN_HISTORY);
  const [reviewers] = useState<Reviewer[]>(REVIEWERS);
  const [finalApprover] = useState<Reviewer>(FINAL_APPROVER);
  const [dimAgeBand, setDimAgeBand] = useState<DimAgeBandItem[]>(DIM_AGE_BAND);
  const [sopKb] = useState<SopKbItem[]>(SOP_KB);
  const [simThresholds, setSimThresholds] = useState<SimThresholds>(DEFAULT_SIM_THRESHOLDS);

  const resetSimThresholds = () => {
    setSimThresholds(DEFAULT_SIM_THRESHOLDS);
    addToast('Simulation thresholds reset to SOP defaults.', 'warn');
  };

  const applySimulatedThresholds = () => {
    // Re-evaluate age bands on existing items based on simulated thresholds
    setExceptions((prev) =>
      prev.map((e) => {
        if (e.dq_issue) return e;
        const omThresh = simThresholds[e.operating_model] || DEFAULT_SIM_THRESHOLDS['Continuity Core'];
        let newBand = e.age_band;
        if (e.age_days >= omThresh.terminalDays) newBand = 'Terminal';
        else if (e.age_days >= omThresh.agedDays) newBand = 'Aged';
        else if (e.age_days >= omThresh.watchDays) newBand = 'Watch';
        else newBand = 'Healthy';
        return { ...e, age_band: newBand };
      })
    );
    addToast('Simulated threshold policies applied across exception repository.', 'success');
  };

  const batchSubmitDecisions = async (excIds: string[], decision: ReviewStatus, comment: string) => {
    if (!excIds.length) return;
    const nowStr = new Date().toISOString();
    const targets = exceptions.filter((e) => excIds.includes(e.id));
    
    setExceptions((prev) =>
      prev.map((e) => (excIds.includes(e.id) ? { ...e, review_status: decision, comment } : e))
    );

    const newAuditEntries: AuditLogItem[] = targets.map((t) => ({
      id: 'AUD-' + Math.random().toString(36).substring(2, 9),
      exception_id: t.id,
      sku: t.sku,
      actor: t.reviewer,
      action: decision,
      comment,
      timestamp: nowStr,
      previous_status: t.review_status
    }));

    setAuditLog((prev) => [...newAuditEntries, ...prev]);

    setNotifications((prev) =>
      prev.map((n) =>
        excIds.includes(n.exception_id) && n.ack_status !== 'Acknowledged'
          ? { ...n, ack_status: 'Acknowledged', ack_time: nowStr }
          : n
      )
    );

    addToast(`Batch decision "${decision}" logged for ${excIds.length} items.`, 'success');
  };

  const batchSendNotifications = async (excIds: string[], channel: ChannelType = 'Teams') => {
    if (!excIds.length) return;
    const nowStr = new Date().toISOString();
    const targets = exceptions.filter((e) => excIds.includes(e.id));

    const newNotifs: NotificationItem[] = targets.map((exc) => {
      const recipient = reviewers.find((r) => r.name === exc.reviewer) || {
        name: exc.reviewer,
        email: exc.reviewer_email
      };
      return {
        id: 'NTF-' + Math.random().toString(36).substring(2, 9),
        exception_id: exc.id,
        sku: exc.sku,
        recipient: recipient.name,
        recipient_email: recipient.email,
        channel,
        sent_time: nowStr,
        ack_status: 'Delivered',
        ack_time: null,
        escalated: false,
        resend_count: 0
      };
    });

    setNotifications((prev) => [...newNotifs, ...prev]);
    addToast(`Dispatched ${excIds.length} notifications via Microsoft Graph (${channel}).`, 'success');
  };

  const [activeNav, setActiveNav] = useState<NavKey>('workbench');
  const [drawerExcId, setDrawerExcId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiConnected] = useState<boolean>(api.isConfigured());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const [queueFilter, setQueueFilterState] = useState<QueueFilters>({ om: '', band: '', status: '', search: '' });
  const [notifFilter, setNotifFilterState] = useState<NotificationFilters>({ ack: '', channel: '', search: '' });
  const [auditFilter, setAuditFilterState] = useState<AuditFilters>({ action: '', search: '' });
  const [analyticsFilter, setAnalyticsFilterState] = useState<AnalyticsFilters>({ om: '', category: '' });

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', from: 'bot', text: CHAT_GREETING }
  ]);
  const [chatTyping, setChatTyping] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Fetch initial data if backend API_BASE URL is configured
  const refreshData = async () => {
    if (!api.isConfigured()) return;
    setLoading(true);
    try {
      const [fetchedExc, fetchedNotif, fetchedAudit, fetchedRuns, fetchedConfig] = await Promise.all([
        api.getExceptions(),
        api.getNotifications(),
        api.getAuditLogs(),
        api.getRunHistory(),
        api.getDimAgeBand()
      ]);
      setExceptions(fetchedExc);
      setNotifications(fetchedNotif);
      setAuditLog(fetchedAudit);
      setRunHistory(fetchedRuns);
      setDimAgeBand(fetchedConfig);
    } catch (err: any) {
      console.warn('API sync error (falling back to initial mock state):', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (api.isConfigured()) {
      refreshData();
    }
  }, []);

  const addToast = (message: string, type: 'success' | 'warn' | 'danger' | '' = '') => {
    const id = 't-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const navigate = (key: NavKey) => {
    setActiveNav(key);
    setMobileMenuOpen(false);
  };

  const openDrawer = (id: string) => {
    setDrawerExcId(id);
  };

  const closeDrawer = () => {
    setDrawerExcId(null);
  };

  const setQueueFilter = (key: keyof QueueFilters, val: string) => {
    setQueueFilterState((prev) => ({ ...prev, [key]: val }));
  };
  const clearQueueFilters = () => {
    setQueueFilterState({ om: '', band: '', status: '', search: '' });
  };

  const setNotifFilter = (key: keyof NotificationFilters, val: string) => {
    setNotifFilterState((prev) => ({ ...prev, [key]: val }));
  };
  const clearNotifFilters = () => {
    setNotifFilterState({ ack: '', channel: '', search: '' });
  };

  const setAuditFilter = (key: keyof AuditFilters, val: string) => {
    setAuditFilterState((prev) => ({ ...prev, [key]: val }));
  };
  const clearAuditFilters = () => {
    setAuditFilterState({ action: '', search: '' });
  };

  const setAnalyticsFilter = (key: keyof AnalyticsFilters, val: string) => {
    setAnalyticsFilterState((prev) => ({ ...prev, [key]: val }));
  };
  const clearAnalyticsFilters = () => {
    setAnalyticsFilterState({ om: '', category: '' });
  };

  const submitDecision = async (excId: string, decision: ReviewStatus, comment: string) => {
    const target = exceptions.find((e) => e.id === excId);
    if (!target) return;

    if (api.isConfigured()) {
      try {
        await api.submitDecision(excId, decision, comment);
        await refreshData();
      } catch (err: any) {
        addToast(`API Submit Failed: ${err.message}`, 'danger');
        return;
      }
    } else {
      // Local State Update
      const prevStatus = target.review_status;
      setExceptions((prev) =>
        prev.map((e) => (e.id === excId ? { ...e, review_status: decision, comment } : e))
      );

      const newAudit: AuditLogItem = {
        id: 'AUD-' + Math.random().toString(36).substring(2, 9),
        exception_id: excId,
        sku: target.sku,
        actor: target.reviewer,
        action: decision,
        comment,
        timestamp: new Date().toISOString(),
        previous_status: prevStatus
      };
      setAuditLog((prev) => [newAudit, ...prev]);

      setNotifications((prev) =>
        prev.map((n) =>
          n.exception_id === excId && n.ack_status !== 'Acknowledged'
            ? { ...n, ack_status: 'Acknowledged', ack_time: new Date().toISOString() }
            : n
        )
      );
    }

    addToast(`Decision "${decision}" recorded for ${target.sku} and written to Review_Status.`, 'success');
    closeDrawer();
  };

  const sendNotification = async (
    excId: string,
    channel: ChannelType = 'Teams',
    recipientName?: string,
    isEscalation = false
  ) => {
    const exc = exceptions.find((e) => e.id === excId);
    if (!exc) return;

    const recipient =
      reviewers.find((r) => r.name === recipientName) ||
      reviewers.find((r) => r.name === exc.reviewer) ||
      { name: exc.reviewer, email: exc.reviewer_email, role: 'Reviewer' };

    if (api.isConfigured()) {
      try {
        await api.sendNotification({
          exception_id: excId,
          channel,
          recipient: recipient.name,
          escalated: isEscalation
        });
        await refreshData();
      } catch (err: any) {
        addToast(`API Notification Failed: ${err.message}`, 'danger');
        return;
      }
    } else {
      const newNotif: NotificationItem = {
        id: 'NTF-' + Math.random().toString(36).substring(2, 9),
        exception_id: excId,
        sku: exc.sku,
        recipient: recipient.name,
        recipient_email: recipient.email,
        channel,
        sent_time: new Date().toISOString(),
        ack_status: 'Delivered',
        ack_time: null,
        escalated: isEscalation,
        resend_count: 0
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    addToast(
      `${isEscalation ? 'Escalation' : 'Notification'} sent to ${recipient.name} via ${channel} (Graph API).`,
      isEscalation ? 'warn' : 'success'
    );
  };

  const resendNotification = async (notifId: string) => {
    if (api.isConfigured()) {
      try {
        await api.resendNotification(notifId);
        await refreshData();
      } catch (err: any) {
        addToast(`API Resend Failed: ${err.message}`, 'danger');
        return;
      }
    } else {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notifId
            ? { ...n, resend_count: n.resend_count + 1, sent_time: new Date().toISOString(), ack_status: 'Delivered' }
            : n
        )
      );
    }
    addToast('Notification resent.', 'success');
  };

  const escalateNotification = async (notifId: string) => {
    const n = notifications.find((x) => x.id === notifId);
    if (!n) return;

    if (api.isConfigured()) {
      try {
        await api.escalateNotification(notifId);
        await refreshData();
      } catch (err: any) {
        addToast(`API Escalation Failed: ${err.message}`, 'danger');
        return;
      }
    } else {
      setNotifications((prev) =>
        prev.map((x) => (x.id === notifId ? { ...x, escalated: true } : x))
      );
      await sendNotification(n.exception_id, 'Email', finalApprover.name, true);
    }
  };

  const triggerManualRun = async () => {
    if (api.isConfigured()) {
      try {
        const runRes = await api.triggerManualRun();
        setRunHistory((prev) => [...prev, runRes]);
        addToast(`Manual run ${runRes.run_id} completed successfully.`, 'success');
        return;
      } catch (err: any) {
        addToast(`API Trigger Run Failed: ${err.message}`, 'danger');
        return;
      }
    }

    const runId = 'RUN-' + (500 + runHistory.length + 1);
    const newRun: RunHistoryItem = {
      run_id: runId,
      timestamp: new Date().toISOString(),
      trigger: 'Manual',
      status: 'Completed',
      records_processed: 2200 + Math.round(Math.random() * 400),
      exceptions_generated: 150 + Math.round(Math.random() * 70),
      data_issues: 3 + Math.round(Math.random() * 15),
      duration_sec: 38 + Math.round(Math.random() * 55)
    };
    setRunHistory((prev) => [...prev, newRun]);
    addToast(`Manual run ${runId} completed successfully.`, 'success');
  };

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  const sendChatMessage = async (inputText?: string) => {
    const query = (inputText || '').trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: 'm-' + Math.random().toString(36).substring(2, 9),
      from: 'user',
      text: query
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatTyping(true);

    if (api.isConfigured()) {
      try {
        const botRes = await api.sendChatMessage(query);
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'b-' + Math.random().toString(36).substring(2, 9),
            from: botRes.url ? 'bot-fallback' : 'bot',
            text: botRes.answer,
            source: botRes.source,
            url: botRes.url
          }
        ]);
        setChatTyping(false);
        return;
      } catch (err: any) {
        console.warn('API Chat Error (falling back to local SOP KB):', err.message);
      }
    }

    setTimeout(() => {
      setChatTyping(false);
      const q = query.toLowerCase();

      let botResponse: ChatMessage;

      if (q.includes('how many pending') || q.includes('pending review')) {
        const pendingCount = exceptions.filter((e) => !e.dq_issue && e.review_status === 'Pending').length;
        botResponse = {
          id: 'b-' + Math.random().toString(36).substring(2, 9),
          from: 'bot',
          text: `There are currently <b>${pendingCount}</b> exceptions with status "Pending" across all Operating Models (live count from the Exception Queue).`,
          source: 'Live platform data'
        };
      } else if (q.includes('overdue') || q.includes('not acknowledged')) {
        const notAckCount = notifications.filter((n) => n.ack_status === 'Not Acknowledged').length;
        botResponse = {
          id: 'b-' + Math.random().toString(36).substring(2, 9),
          from: 'bot',
          text: `There are <b>${notAckCount}</b> notifications currently "Not Acknowledged". Check the Acknowledgment Tracking page for the overdue (>48h SLA) breakdown and one-click escalation.`,
          source: 'Live platform data'
        };
      } else if (q.includes('final approver') || q.includes('who approves')) {
        botResponse = {
          id: 'b-' + Math.random().toString(36).substring(2, 9),
          from: 'bot',
          text: `The final approver for this initiative is <b>${finalApprover.name}</b> (${finalApprover.role}).`,
          source: 'Live platform data'
        };
      } else if (q.includes('healthy') && (q.includes('%') || q.includes('percent') || q.includes('how much'))) {
        const valid = exceptions.filter((e) => !e.dq_issue);
        const totalVal = valid.reduce((s, e) => s + e.inv_value, 0);
        const healthyVal = valid.filter((e) => e.age_band === 'Healthy').reduce((s, e) => s + e.inv_value, 0);
        const pct = totalVal ? ((healthyVal / totalVal) * 100).toFixed(1) : '0';
        botResponse = {
          id: 'b-' + Math.random().toString(36).substring(2, 9),
          from: 'bot',
          text: `Currently <b>${pct}%</b> of total inventory value ($${(healthyVal / 1000000).toFixed(2)}M of $${(totalVal / 1000000).toFixed(2)}M) is classified Healthy - see the Inventory Health gauge on the Overview page.`,
          source: 'Live platform data'
        };
      } else {
        let bestScore = 0;
        let bestEntry: SopKbItem | null = null;
        sopKb.forEach((entry) => {
          const score = entry.keywords.reduce(
            (acc, kw) => acc + (q.includes(kw) ? kw.length : 0),
            0
          );
          if (score > bestScore) {
            bestScore = score;
            bestEntry = entry;
          }
        });

        if (bestScore > 0 && bestEntry) {
          botResponse = {
            id: 'b-' + Math.random().toString(36).substring(2, 9),
            from: 'bot',
            text: (bestEntry as SopKbItem).answer,
            source: (bestEntry as SopKbItem).source
          };
        } else {
          const url =
            'https://www.bing.com/search?q=' +
            encodeURIComponent(query + ' stock ageing inventory exception management best practice');
          botResponse = {
            id: 'b-' + Math.random().toString(36).substring(2, 9),
            from: 'bot-fallback',
            text: `I couldn't find a confident answer to that in the Stock Ageing SOP knowledge base. Escalating to the external research agent for "${query}"...`,
            source: 'External agent search (simulated)',
            url
          };
        }
      }

      setChatMessages((prev) => [...prev, botResponse]);
    }, 700);
  };

  return (
    <AppContext.Provider
      value={{
        exceptions,
        notifications,
        auditLog,
        runHistory,
        reviewers,
        finalApprover,
        dimAgeBand,
        sopKb,
        activeNav,
        drawerExcId,
        queueFilter,
        notifFilter,
        auditFilter,
        analyticsFilter,
        chatOpen,
        mobileMenuOpen,
        chatMessages,
        chatTyping,
        toasts,
        loading,
        apiConnected,
        refreshData,
        navigate,
        openDrawer,
        closeDrawer,
        toggleMobileMenu,
        closeMobileMenu,
        submitDecision,
        sendNotification,
        resendNotification,
        escalateNotification,
        triggerManualRun,
        addToast,
        toggleChat,
        sendChatMessage,
        setQueueFilter,
        clearQueueFilters,
        setNotifFilter,
        clearNotifFilters,
        setAuditFilter,
        clearAuditFilters,
        setAnalyticsFilter,
        clearAnalyticsFilters,
        batchSubmitDecisions,
        batchSendNotifications,
        simThresholds,
        setSimThresholds,
        resetSimThresholds,
        applySimulatedThresholds
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
