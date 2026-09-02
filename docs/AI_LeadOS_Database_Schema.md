# AI LeadOS — Database Schema Design Document

**Project:** AI LeadOS — Multi-Tenant CRM Platform  
**Prepared by:** Arpan Yadav  
**Database:** PostgreSQL (hosted on Supabase)  
**ORM:** Prisma v5  
**Last Updated:** September 2026

---

## Overview

The AI LeadOS database is built on a **multi-tenant architecture**, meaning a single database instance serves multiple isolated workspaces (tenants). Every major entity (Leads, Deals, Tasks, etc.) is scoped to a `tenantId`, ensuring complete data isolation between different organizations using the platform.

---

## Entity Relationship Summary

```
Tenant ──< User ──< Lead ──< Deal
                        ├──< Task
                        ├──< Activity
                        ├──< AIInsight
                        ├──< CommunicationLog
                        └──< SequenceEnrollment ──< Sequence

Tenant ──< TenantSettings
Tenant ──< CustomRole ──< User
Tenant ──< Workflow ──< WorkflowExecution
Tenant ──< EmailAccount
Tenant ──< WhatsAppAccount
Tenant ──< Invitation
```

---

## Table Definitions

---

### 1. `tenants`
The root entity of the multi-tenant architecture. Every workspace (company) in the system is a Tenant.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique tenant identifier |
| `name` | String | NOT NULL | Company / workspace name |
| `createdAt` | DateTime | DEFAULT now() | Record creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Relations:** Has many `users`, `leads`, `deals`, `tasks`, `activities`, `workflows`, `sequences`, `communicationLogs`, `invitations`, `emailAccounts`, `whatsAppAccounts`, `customRoles`. Has one `tenantSettings`.

---

### 2. `users`
Represents individuals who can log into the platform. Scoped to a single tenant.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique user identifier |
| `email` | String | UNIQUE, NOT NULL | Login email address |
| `name` | String | NOT NULL | Display name |
| `password` | String | NOT NULL | Bcrypt-hashed password |
| `isSuperAdmin` | Boolean | DEFAULT false | Full platform access flag |
| `tenantId` | String | FK → tenants.id | Workspace this user belongs to |
| `roleId` | String | FK → custom_roles.id | Assigned role with permissions |
| `avatar` | String | NULLABLE | Profile picture URL |
| `createdAt` | DateTime | DEFAULT now() | Record creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

**Relations:** Belongs to one `Tenant` and one `CustomRole`. Has many `leads`, `deals`, `tasks`, `activities`, `workflows`, `sequences`, `communicationLogs`, `supportTickets`.

---

### 3. `custom_roles`
Defines granular permission sets assignable to users within a tenant.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique role identifier |
| `name` | String | NOT NULL | Role display name (e.g., "Admin", "Manager") |
| `permissions` | JSON | NOT NULL | Granular permission flags |
| `isDefault` | Boolean | DEFAULT false | Default role for new users |
| `tenantId` | String | FK → tenants.id | Scope of the role |

**Permissions JSON Example:**
```json
{ "viewAllLeads": true, "manageUsers": true, "deleteData": false, "addLeads": true }
```

---

### 4. `leads`
Core CRM entity. Represents a potential customer or sales opportunity.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique lead identifier |
| `name` | String | NOT NULL | Lead's full name |
| `email` | String | NOT NULL | Lead's email address |
| `company` | String | NOT NULL | Company the lead works for |
| `title` | String | NULLABLE | Job title |
| `phone` | String | NULLABLE | Phone number |
| `website` | String | NULLABLE | Company website URL |
| `linkedin` | String | NULLABLE | LinkedIn profile URL |
| `status` | Enum | DEFAULT `NEW` | `NEW`, `CONTACTED`, `QUALIFIED`, `UNQUALIFIED`, `CONVERTED` |
| `source` | Enum | DEFAULT `WEBSITE` | `WHATSAPP`, `EMAIL`, `META_LEADS`, `LINKEDIN`, `WEBSITE`, `COLD_OUTREACH`, `REFERRAL` |
| `score` | Int | DEFAULT 0 | AI-generated lead quality score (0–100) |
| `lastContacted` | DateTime | NULLABLE | Timestamp of last outreach |
| `assignedToId` | String | FK → users.id | Sales rep responsible for this lead |
| `tenantId` | String | FK → tenants.id | Workspace scope |
| `createdAt` | DateTime | DEFAULT now() | Record creation timestamp |
| `updatedAt` | DateTime | Auto-updated | Last modification timestamp |

---

### 5. `deals`
Represents a financial opportunity linked to a lead. Used in the Sales Pipeline view.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique deal identifier |
| `title` | String | NOT NULL | Deal name / description |
| `amount` | Float | NOT NULL | Monetary value of the deal |
| `stage` | Enum | DEFAULT `DISCOVERY` | `DISCOVERY`, `PROPOSAL`, `NEGOTIATION`, `CLOSING`, `WON`, `LOST` |
| `expectedCloseDate` | DateTime | NULLABLE | Target close date |
| `closedAt` | DateTime | NULLABLE | Actual close date |
| `notes` | String | NULLABLE | Free-text notes |
| `leadId` | String | FK → leads.id | Associated lead |
| `ownerId` | String | FK → users.id | Deal owner |
| `tenantId` | String | FK → tenants.id | Workspace scope |

---

### 6. `tasks`
To-do items assignable to users, optionally linked to a lead.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique task identifier |
| `title` | String | NOT NULL | Task name |
| `description` | String | NULLABLE | Detailed description |
| `dueDate` | DateTime | NULLABLE | Task deadline |
| `priority` | String | DEFAULT `medium` | `low`, `medium`, `high` |
| `status` | String | DEFAULT `pending` | `pending`, `in_progress`, `completed` |
| `completedAt` | DateTime | NULLABLE | Completion timestamp |
| `assignedToId` | String | FK → users.id | User responsible |
| `leadId` | String | FK → leads.id | Associated lead (optional) |
| `tenantId` | String | FK → tenants.id | Workspace scope |

---

### 7. `activities`
An immutable audit log of all actions taken on a lead.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique activity identifier |
| `type` | String | NOT NULL | e.g., `email_sent`, `call_logged`, `note_added` |
| `content` | String | NOT NULL | Human-readable description |
| `timestamp` | DateTime | DEFAULT now() | When the activity occurred |
| `metadata` | JSON | NULLABLE | Extra structured data |
| `userId` | String | FK → users.id | User who performed the action |
| `leadId` | String | FK → leads.id | Lead this activity is attached to |
| `tenantId` | String | FK → tenants.id | Workspace scope |

---

### 8. `ai_insights`
Stores AI-generated analysis reports for individual leads, powered by Google Gemini.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique insight identifier |
| `analysis` | String | NOT NULL | AI-generated lead analysis summary |
| `opportunities` | String[] | NOT NULL | List of identified opportunities |
| `websiteAudit` | String | NULLABLE | AI audit of the lead's website |
| `sentiment` | String | NOT NULL | `positive`, `neutral`, `negative` |
| `qualityScore` | Int | NOT NULL | 0–100 lead quality score |
| `qualityReason` | String | NOT NULL | Explanation of the quality score |
| `nextAction` | String | NULLABLE | AI-recommended next step |
| `rawResponse` | JSON | NULLABLE | Full raw response from Gemini API |
| `model` | String | DEFAULT `gemini-1.5-flash` | AI model used |
| `leadId` | String | FK → leads.id | Lead this insight belongs to |
| `tenantId` | String | FK → tenants.id | Workspace scope |

---

### 9. `workflows`
Represents an automation workflow built in the visual Workflow Builder.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique workflow identifier |
| `name` | String | NOT NULL | Workflow name |
| `description` | String | NULLABLE | Description of the automation |
| `status` | Enum | DEFAULT `DRAFT` | `DRAFT`, `ACTIVE`, `PAUSED`, `ARCHIVED` |
| `hasAINodes` | Boolean | DEFAULT false | Whether the workflow uses AI nodes |
| `definition` | JSON | NOT NULL | Full node/edge graph definition |
| `metrics` | JSON | NULLABLE | Aggregated execution metrics |
| `tags` | String[] | NOT NULL | Categorization tags |
| `createdById` | String | FK → users.id | Creator |
| `tenantId` | String | FK → tenants.id | Workspace scope |

---

### 10. `workflow_executions`
A run log for every time a workflow was triggered against a lead.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique execution identifier |
| `status` | String | NOT NULL | `running`, `completed`, `failed` |
| `leadId` | String | FK → leads.id | Lead the workflow ran against |
| `context` | JSON | NULLABLE | Data context passed into the run |
| `nodeResults` | JSON | NULLABLE | Per-node output results |
| `currentStep` | Int | DEFAULT 1 | Current step index |
| `startedAt` | DateTime | DEFAULT now() | When execution started |
| `completedAt` | DateTime | NULLABLE | When execution finished |
| `workflowId` | String | FK → workflows.id | Parent workflow |
| `tenantId` | String | FK → tenants.id | Workspace scope |

---

### 11. `sequences`
Multi-step automated outreach campaigns (e.g., Day 1 Email → Day 3 WhatsApp → Day 7 Follow-up).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique sequence identifier |
| `name` | String | NOT NULL | Sequence name |
| `status` | Enum | DEFAULT `DRAFT` | `DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `ARCHIVED` |
| `durationDays` | Int | DEFAULT 7 | Total duration in days |
| `aiEnabled` | Boolean | DEFAULT true | Whether AI personalizes messages |
| `steps` | JSON | NOT NULL | Ordered array of sequence steps |
| `enrollment` | JSON | NOT NULL | Enrollment trigger rules |
| `exitRules` | JSON | NOT NULL | Conditions that exit a lead |
| `metrics` | JSON | NULLABLE | Performance metrics |
| `tags` | String[] | NOT NULL | Categorization tags |
| `createdById` | String | FK → users.id | Creator |
| `tenantId` | String | FK → tenants.id | Workspace scope |

---

### 12. `sequence_enrollments`
Tracks which leads are enrolled in which sequences and their current progress.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique enrollment identifier |
| `status` | String | DEFAULT `active` | `active`, `paused`, `completed`, `exited` |
| `currentStepNumber` | Int | DEFAULT 1 | Current step the lead is on |
| `enrolledAt` | DateTime | DEFAULT now() | Enrollment timestamp |
| `nextStepAt` | DateTime | NULLABLE | When the next step will execute |
| `exitedAt` | DateTime | NULLABLE | When the lead exited |
| `exitReason` | String | NULLABLE | Why the lead exited |
| `stepHistory` | JSON | NULLABLE | Log of completed steps |
| `sequenceId` | String | FK → sequences.id | Parent sequence |
| `leadId` | String | FK → leads.id | Enrolled lead |
| `tenantId` | String | FK → tenants.id | Workspace scope |

---

### 13. `communication_logs`
A unified inbox log of all emails and WhatsApp messages.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique log identifier |
| `channel` | String | NOT NULL | `email`, `whatsapp` |
| `direction` | String | NOT NULL | `outbound`, `inbound` |
| `status` | String | NOT NULL | `sent`, `delivered`, `read`, `failed` |
| `subject` | String | NULLABLE | Email subject line |
| `content` | String | NOT NULL | Message body |
| `metadata` | JSON | NULLABLE | Extra data (e.g., message SID) |
| `sentAt` | DateTime | DEFAULT now() | Send timestamp |
| `deliveredAt` | DateTime | NULLABLE | Delivery confirmation timestamp |
| `readAt` | DateTime | NULLABLE | Read receipt timestamp |
| `leadId` | String | FK → leads.id | Associated lead |
| `userId` | String | FK → users.id | User who sent/received |
| `tenantId` | String | FK → tenants.id | Workspace scope |

**Indexes:** `leadId`

---

### 14. `tenant_settings`
BYOK (Bring Your Own Key) configuration for each tenant's third-party integrations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique settings identifier |
| `tenantId` | String | UNIQUE FK | One-to-one with Tenant |
| `geminiApiKey` | String | NULLABLE | Google Gemini AI API key |
| `waPhoneNumberId` | String | NULLABLE | Meta Business Phone Number ID |
| `waAccessToken` | String | NULLABLE | Meta WhatsApp access token |
| `waConnectionStatus` | String | DEFAULT `DISCONNECTED` | WhatsApp connection status |
| `emailProvider` | String | DEFAULT `SMTP` | `SMTP`, `RESEND`, `GMAIL_OAUTH` |
| `resendApiKey` | String | NULLABLE | Resend.com API key |
| `smtpHost/Port/User/Pass` | Various | NULLABLE | SMTP credentials |
| `gmailClientId/Secret/RefreshToken` | Various | NULLABLE | Gmail OAuth credentials |

---

### 15. `invitations`
Secure invite tokens that allow new users to join a specific tenant workspace.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique invitation identifier |
| `token` | String | UNIQUE | Cryptographically random 32-byte hex token |
| `email` | String | NULLABLE | Pre-filled email for the invitee |
| `tenantId` | String | FK → tenants.id | Tenant to join on acceptance |
| `used` | Boolean | DEFAULT false | Whether the invite has been consumed |
| `expiresAt` | DateTime | NOT NULL | Token expiry (7 days from creation) |

---

### 16. `event_logs`
Platform-wide audit trail for all significant system events.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | PK, CUID | Unique event identifier |
| `type` | String | NOT NULL | Event type string |
| `category` | Enum | NOT NULL | `CRM`, `COMMUNICATION`, `AI`, `AUTOMATION`, `SYSTEM` |
| `entityId` | String | NOT NULL | ID of the triggering entity |
| `entityType` | String | NOT NULL | Type of the entity (e.g., `lead`, `workflow`) |
| `payload` | JSON | NOT NULL | Event-specific data payload |
| `timestamp` | DateTime | DEFAULT now() | When the event occurred |

**Indexes:** `(type, timestamp)`, `(entityId, entityType)`

---

### 17. `email_accounts` & 18. `whatsapp_accounts`
Multi-account channel configuration — allows a tenant to connect multiple sending channels.

| Column | Type | Description |
|---|---|---|
| `id` | String | Unique identifier |
| `tenantId` | String | Owning tenant |
| `name` | String | Friendly label (e.g., "Sales Gmail") |
| `dailyLimit` | Int | Max sends per day |
| `sentToday` | Int | Counter reset daily |
| `isActive` | Boolean | Enable/disable the account |
| *(credentials)* | Various | Provider-specific API keys / tokens |

---

### 19. `support_tickets` & 20. `faqs`
In-app help center content and user-submitted support requests.

---

## Enumerations

| Enum | Values |
|---|---|
| `LeadStatus` | `NEW`, `CONTACTED`, `QUALIFIED`, `UNQUALIFIED`, `CONVERTED` |
| `LeadSource` | `WHATSAPP`, `EMAIL`, `META_LEADS`, `LINKEDIN`, `WEBSITE`, `COLD_OUTREACH`, `REFERRAL` |
| `DealStage` | `DISCOVERY`, `PROPOSAL`, `NEGOTIATION`, `CLOSING`, `WON`, `LOST` |
| `WorkflowStatus` | `DRAFT`, `ACTIVE`, `PAUSED`, `ARCHIVED` |
| `SequenceStatus` | `DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `ARCHIVED` |
| `EventCategory` | `CRM`, `COMMUNICATION`, `AI`, `AUTOMATION`, `SYSTEM` |

---

## Key Design Decisions

1. **Multi-Tenancy via `tenantId`:** All tables share a single schema. The `tenantId` foreign key on every entity ensures data isolation at the query level without the cost of separate databases per tenant.

2. **CUID over UUID:** `cuid()` is used as the primary key generator because CUIDs are URL-friendly, collision-resistant, and sortable by creation time — ideal for web APIs.

3. **BYOK (Bring Your Own Key):** The `tenant_settings` table stores each tenant's own third-party API keys (Gemini, WhatsApp, SMTP). The platform itself does not pay for AI or communication costs on behalf of tenants.

4. **JSON for Flexible Schemas:** Fields like `workflow.definition`, `sequence.steps`, and `customRole.permissions` use JSON columns to avoid over-engineering a rigid relational schema for data that is inherently flexible.

5. **Event Log as Audit Trail:** The `event_logs` table acts as a system-wide audit trail, decoupled from the main entity tables. This enables future analytics, replay functionality, and debugging without polluting the core tables.

---

*Document prepared by Arpan Yadav — ProyoTech Internship Project, 2026*
