1. Executive Summary 

This document supersedes the earlier Power BI / Power Automate solution architecture for Agentic Exception Management – Stock Ageing. Based on direction to move to a single custom-built platform, the reporting layer (Power BI) and the workflow/notification layer (Power Automate + Teams/SharePoint) are replaced by one purpose-built React application backed by a custom API, while Snowflake remains the data and business-rule engine. 

The objective is a single pane of glass where a reviewer can see the prioritised exception list, drill into ageing analytics and data quality, take an action, trigger a notification, and track its acknowledgment — all without leaving one application or switching between Power BI, Teams, SharePoint and email. This gives TWG full ownership of the UX, the workflow logic, and the notification/escalation rules, and creates a foundation that can absorb the DOS/StoresDOS backlog (BR-009) and the insight chatbot as native features rather than bolt-ons. 

Key outcomes of this shift: 

One unified, custom-branded platform instead of three disconnected tools (Power BI + Power Automate + Teams/SharePoint). 

Full control over business logic, SLA rules, and escalation paths — not constrained by Power Automate connector limits or Power BI's read-only nature. 

Real-time, in-app visibility of notification delivery and acknowledgment status, rather than relying on Teams/email as the only channel. 

A single, extensible codebase that can host the insight chatbot, future DOS/StoresDOS features, and any other exception-management use case TWG adds later. 

Reduced per-user licensing dependency on Power BI Pro / Power Automate premium connectors, in exchange for standard web-app hosting costs. 

Snowflake is retained as the system of record for curated ageing data and the business rule engine (classification, prioritisation, recommendation) — this part of the original architecture does not change. What changes is everything above it: reporting, workflow, and notifications are now custom-built and owned end-to-end by the platform team. 

 

2. Why a Custom Platform (vs. Power BI + Power Automate) 

The table below compares the two approaches directly against the outcomes TWG is asking for: better visibility, actionable insights, and a better end-to-end view of the business process. 

Capability 

Power BI + Power Automate (previous) 

Custom React Platform (this document) 

Single pane of glass 

Split across Power BI (view) + Teams/SharePoint (act) + email (notify) — 3+ surfaces 

One application: view, act, notify, and track acknowledgment all in the same screen 

Action capability 

Power BI cannot write back; action happens in a separate Power Automate/Teams flow 

Native — the same UI that shows the exception also captures the decision 

Notification & ack tracking 

Power Automate approval + Teams Adaptive Card; ack tracked indirectly via flow run history 

Purpose-built Notification Center + Acknowledgment SLA Tracker with live status, resend, and escalation, in-app 

Customisation of workflow/SLA logic 

Limited to Power Automate's connector/condition model 

Full control — any SLA, routing, or escalation rule can be coded directly 

Real-time updates 

Power BI requires refresh; Power Automate is event-triggered but not always visible to the reviewer live 

WebSocket/SignalR push updates so status changes appear instantly for every open session 

Extensibility (chatbot, DOS backlog, etc.) 

Requires stitching Copilot Studio + Power BI + Power Automate together 

New modules are simply new React views/API endpoints in the same codebase 

Licensing 

Power BI Pro/Premium + Power Automate premium connectors per user 

Standard app hosting (Azure App Service/Static Web Apps) — no per-user BI/Automate licence 

Governance & audit 

Split across Power BI usage metrics, Power Automate run history, and Teams/SharePoint activity logs 

Single audit trail in the platform's own database, queryable and exportable centrally 

Snowflake's role is unchanged in either model — it continues to house the curated ageing data and the classification/prioritisation/recommendation logic (Section 4 of the original architecture). The difference is entirely in how that output is surfaced, actioned, and tracked. 

 

3. End-to-End Architecture Overview 

The platform is organised into three layers, with governance spanning all of them. Layer 1 (Snowflake) is unchanged from the original design; Layers 2 and 3 are the new custom-built components that replace Power BI and Power Automate. 

Architecture
Custom platform architecture replacing Power BI and Power Automate 

Layer summary: 

Data & Rule Engine (unchanged) — Snowflake houses the curated ageing data mart and the classification/prioritisation/recommendation logic, orchestrated by a lightweight scheduler service (replacing the Power Automate trigger with a simple Node cron job or Azure Function timer). 

Custom Backend API (new) — A Node.js/.NET Core REST API sits between Snowflake and the React app, handling authentication, business operations (decisions, notifications, audit), an operational database for fast reads/writes, a notification microservice that talks to Microsoft Graph API directly (no Power Automate connector needed), and a real-time gateway (WebSocket/SignalR) for live status pushes. 

Custom React Platform (new) — The single pane of glass: Analytics Dashboards, Exception Queue with an in-context Action Drawer, Notification Center, Acknowledgment SLA Tracker, Audit Log, Config Console, and (in a later phase) an embedded insight chatbot. 

Governance — Entra ID SSO, RBAC/row-level security, a full audit trail, and mandatory human-in-the-loop approval — is enforced consistently at the API layer across every module, so no view or action can bypass these controls regardless of which part of the UI the reviewer is using. 

 

4. Custom React Platform — Frontend 

The frontend is a single React (TypeScript) single-page application (SPA), designed as the one place a reviewer works from all day. It consolidates what was previously split across a Power BI report, a Teams channel, a SharePoint list, and email into one consistent, real-time experience. 

4.1 Application Modules 

Module 

Purpose 

Key Interactions 

Analytics Dashboard 

Trend and portfolio view of ageing exposure (replaces Power BI's Ageing Analytics page) 

Value by Category × Age Band, at-risk % by Operating Model, trend over time, drill-down to underlying exceptions 

Data Quality 

Surfaces quarantined records that failed classification (BR-008) 

Issue-reason breakdown, drill-through to the specific SKUs, direct link to request a source-data fix 

Exception Queue 

Prioritised, filterable worklist of all exceptions 

Sort/filter by Operating Model, Age Band, Status, Category; click a row to open the Action Drawer 

Action Drawer 

In-context panel for a single exception 

View recommendation & rationale; send/resend a Teams or Email notification; view that notification's live ack timeline; record Accept/Modify/Reject/Pending with comments 

Notification Center 

Full log of every alert sent from the platform 

Filter by channel/ack status, resend, view delivery timestamps 

Acknowledgment SLA Tracker 

SLA monitoring for reviewer response time 

Overdue queue with elapsed-time progress bars, one-click escalation to the designated final approver 

Audit Log 

Full, immutable history of every decision 

Filter by action/reviewer, exportable for compliance evidence 

Run History & Config 

Pipeline run visibility and threshold governance 

Manual run trigger, DimAgeBand threshold reference (read-only unless SME role) 

Insight Chatbot (Phase 3) 

Natural-language Q&A over the same data 

Embedded chat panel, calls the same backend API / Snowflake Cortex Analyst as the dashboards 

4.2 Frontend Technology Choices 

React 18+ with TypeScript for type safety across a growing codebase with many contributors over time. 

Fluent UI React (Microsoft's component library) recommended for visual consistency with the rest of TWG's Microsoft 365 estate, while remaining a fully custom, self-hosted application. 

TanStack Query (React Query) for server-state management — caching, background refetch, and optimistic updates when a reviewer submits a decision or sends a notification. 

Recharts or Chart.js for the analytics visuals (bar, matrix/heatmap, trend line) — lightweight and easily themed to TWG's colour standards (Aged/Terminal/Healthy colour coding carried over from the Power BI wireframe). 

SignalR client (or native WebSocket) for real-time push — so when one reviewer submits a decision or a notification is acknowledged, every other open session updates instantly without a manual refresh. 

MSAL.js for Entra ID authentication, giving single sign-on consistent with the rest of TWG's Microsoft environment even though the app itself is custom-built. 

 

5. Custom Backend API 

The backend replaces both Power BI's data connection layer and Power Automate's workflow engine with a single custom API service. It is the one place that enforces business rules, security, and audit — the React frontend never talks to Snowflake or Microsoft Graph directly. 

5.1 Core Responsibilities 

Expose REST (or GraphQL) endpoints for exceptions, decisions, notifications, acknowledgments, audit log, run history, and configuration — one contract for the entire frontend. 

Enforce authentication (Entra ID / OAuth2) and role-based authorisation on every request — e.g., only a config-owner role can edit DimAgeBand-equivalent thresholds; only an assigned reviewer or the final approver can action a given exception. 

Read the curated, prioritised exception data from Snowflake (via the Snowflake Node.js/.NET connector) and cache/serve it efficiently to the frontend. 

Own the operational data that changes frequently — Review_Status, Notifications, Audit_Log, User/Role config — in a dedicated operational database rather than writing this at high frequency directly into Snowflake. 

Orchestrate the notification microservice (Section 6) when a reviewer sends/resends an alert or when an SLA escalation is triggered. 

Push real-time events (new exception batch, notification acknowledged, decision recorded) to connected clients via the real-time gateway. 

5.2 Why a Separate Operational Database (not writing directly to Snowflake) 

Snowflake is optimised for large analytical reads, not high-frequency, low-latency transactional writes (e.g., every notification send, every ack event, every decision). The recommended pattern is: 

Snowflake remains the analytical source of truth for ageing data and the output of the business rule engine (Fact_Inventory_Ageing, Curated.Prioritised_Exceptions, etc.) — read-heavy, refreshed on the agent's run cadence. 

A lightweight operational store — Azure SQL Database or PostgreSQL — holds Review_Status, Notifications, Audit_Log and platform configuration, which change frequently and need immediate read-after-write consistency for the UI. 

A scheduled sync (or Snowflake Streams-based CDC) periodically reconciles decision outcomes back into Snowflake for long-term analytics and to keep a single historical record, without making the operational database a bottleneck on every user action. 

If TWG prefers a single-database strategy, Snowflake's Hybrid Tables (Unistore) can serve this purpose instead — this should be validated against current Snowflake edition/licensing before committing to that approach. 

5.3 Recommended Technology Stack 

Component 

Recommendation 

Notes 

API Framework 

Node.js + Express (or NestJS) / .NET Core Web API 

Either is suitable; Node.js aligns well with a React/TypeScript team for shared tooling and types 

Operational Database 

Azure SQL Database or PostgreSQL (Azure Database for PostgreSQL) 

Stores Review_Status, Notifications, Audit_Log, Users/Roles, Config 

ORM / Data Access 

Prisma (Node.js) or Entity Framework Core (.NET) 

Type-safe queries, migrations, and schema versioning 

Auth 

Entra ID with OAuth2/OIDC, validated via MSAL / Microsoft.Identity.Web 

Single sign-on consistent with TWG's existing Microsoft 365 identity 

Real-time Gateway 

Azure SignalR Service (or self-hosted WebSocket server) 

Push notification/ack/decision events to all connected reviewer sessions 

Scheduler 

Azure Function (Timer Trigger) or Node cron 

Triggers the Snowflake agent run and, on completion, notifies the backend to refresh cached exception data 

Hosting 

Azure App Service (API) + Azure Static Web Apps or App Service (React build) 

Standard PaaS hosting; scales independently from the frontend 

 

6. Notification Microservice (Replacing Power Automate + Teams/SharePoint) 

This is the most direct replacement for what Power Automate + Teams/SharePoint previously did. Instead of a low-code flow, it is a dedicated backend microservice that calls Microsoft Graph API directly — giving full custom control over message content, retry logic, escalation rules, and delivery/acknowledgment tracking, all visible inside the same platform. 

6.1 Sending Notifications 

Teams: Use the Microsoft Graph API's chatMessage endpoint (or a registered Teams bot via the Bot Framework) to post an Adaptive Card directly into the reviewer's Teams chat — replacing the Power Automate 'Post Adaptive Card' action with an equivalent direct API call the platform fully controls. 

Email: Use the Microsoft Graph API's sendMail endpoint (or Azure Communication Services / SendGrid as an alternative) for the email channel. 

Every send is logged immediately into the operational database's Notifications table with a delivery timestamp, so the Notification Center reflects it in real time. 

6.2 Capturing Acknowledgment (Replacing the Power Automate Approval Step) 

Teams Adaptive Cards support an Action.Submit button; when the reviewer taps Accept/Modify/Reject directly on the card, Teams calls back to a webhook endpoint on the backend API (registered via the Bot Framework), which updates the Notifications and Review_Status tables immediately — this replaces the Power Automate approval connector entirely, and is faster since there's no intermediate flow run. 

If the reviewer instead opens the platform directly (rather than acting from the Teams card), the same decision recorded in the Action Drawer updates the notification's acknowledgment status automatically, since both paths write to the same operational database. 

Email acknowledgment is captured either via a tracked link back to the platform (reviewer clicks through to action the item) or, optionally, via read-receipt where supported — the platform-side action remains the authoritative source of truth. 

6.3 SLA Monitoring & Escalation 

The scheduler service runs a periodic job (e.g., hourly) checking for notifications past the configured SLA (default 48h, configurable) with no acknowledgment. 

For Terminal-band exceptions overdue beyond SLA, the service automatically triggers an escalation notification to the designated final approver, and flags the item in the Acknowledgment SLA Tracker — the same rule previously implemented as a Power Automate condition branch, now expressed directly in code with full flexibility to add new rules. 

6.4 Why This Is More Capable Than Power Automate 

Capability 

Power Automate (previous) 

Custom Notification Microservice (this design) 

Message customisation 

Limited to connector's card/template options 

Full control over Adaptive Card JSON, branding, and content logic 

Retry & failure handling 

Built-in retry policies, limited custom logic 

Fully custom retry/backoff and failure alerting, tailored to TWG's SOP 

Ack visibility 

Buried in flow run history, hard to report on 

First-class Notification Center and SLA Tracker UI, queryable, exportable 

Escalation rules 

Condition branches within the flow designer 

Arbitrary business logic in code — easy to extend as SOP evolves 

Cost 

Premium connector licensing per flow/user in some tiers 

Standard Graph API calls within existing Microsoft 365 tenant entitlement 

 

7. Operational Data Model (New) 

The following tables are new — they live in the operational database (Section 5.2) and are what the React platform reads/writes directly, distinct from Snowflake's analytical tables. 

Table 

Key Fields 

Purpose 

Exceptions (cached from Snowflake) 

exception_id, sku, operating_model, age_band, age_days, inv_value, priority_rank, recommended_action, rationale 

Read-optimised local cache of Snowflake's Curated.Prioritised_Exceptions, refreshed each agent run 

Review_Status 

exception_id, status, reviewer, comment, decided_at 

Reviewer decisions — written by the Action Drawer, periodically synced back to Snowflake 

Notifications 

notification_id, exception_id, channel, recipient, sent_at, ack_status, ack_at, escalated, resend_count 

Every alert sent, its delivery status, and acknowledgment tracking 

Audit_Log 

audit_id, exception_id, actor, action, previous_status, comment, timestamp 

Immutable history of every decision for compliance evidence 

Users_Roles 

user_id, email, role (Reviewer/SME/Final Approver/Admin), operating_model_scope 

RBAC — controls both UI visibility and API authorisation 

Run_History 

run_id, trigger, status, records_processed, exceptions_generated, data_issues, duration 

Agent pipeline execution log, surfaced in the Run History module 

 

8. Human-in-the-Loop Governance & Controls 

The same non-negotiable controls from the original BRD apply here, now enforced at the custom API layer instead of via Power BI/Power Automate configuration. 

Control Point 

Rule 

How the Custom Platform Enforces It 

Threshold approval 

Ageing thresholds validated before use 

Config Console is editable only by the SME/Config-owner role; every change is versioned in Audit_Log 

Recommendation review 

Every recommendation requires human review before action 

The API refuses to mark an exception 'actioned' in any downstream system without a Review_Status entry created by an authenticated reviewer 

Business action execution 

Platform must not execute markdown/write-off/stock movement/etc. 

The backend has no write credentials to ERP/WMS — it only records the decision; execution remains a manual step in TWG's systems 

Rule changes 

Threshold/action changes must be version controlled 

All configuration changes are stored with before/after values and actor identity in Audit_Log; source code changes go through standard Git-based CI/CD 

Access control 

Reviewers see only their scope 

RBAC + row-level filtering by Operating Model enforced in every API query, not just in the UI 

 

9. Non-Functional Considerations 

9.1 Security 

Entra ID SSO across the React app and API, consistent with TWG's existing identity provider. 

All API endpoints authenticated and authorised per-request; no anonymous access to any exception or notification data. 

Secrets (Snowflake credentials, Graph API app registration) stored in Azure Key Vault, never in source control or client-side code. 

9.2 Scalability & Performance 

The operational database and API are decoupled from Snowflake's query load, so the reviewer UI stays fast regardless of Snowflake warehouse activity. 

Real-time gateway (SignalR) scales horizontally via Azure SignalR Service, supporting concurrent reviewer sessions without a custom WebSocket cluster to manage. 

As the DOS/StoresDOS backlog (BR-009) is added, it becomes a new set of API endpoints and React views reusing the same authentication, notification, and audit infrastructure — no new platform needed. 

9.3 Monitoring & Observability 

Application Insights (or equivalent APM) on both the API and frontend for error tracking, performance monitoring, and usage analytics — replacing Power BI usage metrics and Power Automate run history as the single place to monitor platform health. 

Structured logging for every notification send, acknowledgment, and decision, correlated by exception_id for full traceability. 

9.4 Migration Considerations 

Historical data from any existing Power BI dataset or Power Automate flow run history can be backfilled into Audit_Log and Notifications during migration, so historical context is not lost. 

A short parallel-run period (custom platform + existing Power BI/Power Automate side-by-side) is recommended before fully decommissioning the previous tooling, to validate ack tracking and escalation logic against real reviewer behaviour. 

 

10. Phased Delivery Roadmap 

Phase 

Scope 

Exit Criteria 

Phase 0 – Foundation (1–2 wks) 

Confirm Snowflake access/schema (unchanged from original BRD), stand up Azure resources (App Service, SQL/Postgres, Key Vault, SignalR), Entra ID app registrations for the API and Graph API notification sending. 

Environments provisioned; auth flow working end-to-end. 

Phase 1 – MVP (3–5 wks) 

Exception Queue + Action Drawer + Review_Status write path; basic Teams/Email notification sending via Graph API; Audit Log. 

A reviewer can see, action, and get notified on an exception fully within the new platform. 

Phase 2 – Full Workflow (3—4 wks) 

Acknowledgment capture (Teams card callback), Notification Center, Acknowledgment SLA Tracker with escalation automation, Run History, Config Console. 

End-to-end SOP loop — notify, act, acknowledge, escalate — fully replicated without Power Automate. 

Phase 3 – Analytics & Chatbot (3—4 wks, can run parallel to Phase 2) 

Analytics Dashboard and Data Quality modules (replacing Power BI's remaining pages); embedded insight chatbot calling the same API / Snowflake Cortex Analyst. 

Reviewers no longer need Power BI at all; chatbot answers questions using live platform data. 

Phase 4 – Decommission & Scale 

Parallel-run validation complete; decommission Power BI workspace and Power Automate flows; extend platform to DOS/StoresDOS backlog (BR-009). 

Business owner sign-off to retire previous tooling and expand scope. 

 

11. Immediate Next Steps 

Confirm this custom-platform direction with the business owner (Reagan Davis / Brett Sharman) and formally deprecate the Power BI/Power Automate variant of this architecture. 

Provision Azure resources (App Service, Azure SQL/PostgreSQL, Key Vault, SignalR Service) and register the Entra ID applications needed for SSO and Graph API notification sending. 

Validate Graph API permissions (Mail.Send, ChatMessage.Send or Teams bot registration) with TWG's Microsoft 365 tenant admin — this typically requires admin consent and should be requested early to avoid delaying Phase 1. 

Confirm the same open items from the original BRD that still apply regardless of platform choice: alert scope (Watch+Aged+Terminal vs. Aged+Terminal only), reviewer/approver assignments, inventory value availability, and DimPolicyThreshold/DOS scoping. 

Decide on the operational database engine (Azure SQL vs. PostgreSQL vs. Snowflake Hybrid Tables) based on TWG's existing Azure footprint and team familiarity. 

Once these are confirmed, Phase 1 (Exception Queue + Action Drawer + basic notification sending) can begin immediately, giving TWG a working end-to-end loop — view, act, notify — within the custom platform before Power BI/Power Automate are fully decommissioned. 
