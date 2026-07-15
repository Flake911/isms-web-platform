# SentraISMS — Platform Documentation
## Full Page Reference: Purpose, Content & Usage

**Standard:** ISO 27001:2022  
**Platform:** SentraISMS (Next.js 16 + NestJS 11 + PostgreSQL + Prisma ORM)  
**Date:** May 2026

---

## Table of Contents

1. [Login](#1-login)
2. [Dashboard](#2-dashboard)
3. [Context & ISMS Scope](#3-context--isms-scope)
4. [Risk Management](#4-risk-management)
5. [Controls — Annex A](#5-controls--annex-a)
6. [Asset Inventory](#6-asset-inventory)
7. [Incident Management](#7-incident-management)
8. [Policies & Documents](#8-policies--documents)
9. [Training Records](#9-training-records)
10. [Security Awareness](#10-security-awareness)
11. [Audits](#11-audits)
12. [Vendor Management](#12-vendor-management)
13. [Compliance Register](#13-compliance-register)
14. [Objectives](#14-objectives)
15. [Leadership & Roles](#15-leadership--roles)
16. [Change Management](#16-change-management)
17. [Management Review](#17-management-review)
18. [Communication Plan](#18-communication-plan)
19. [CAPA](#19-capa--corrective--preventive-actions)
20. [Continual Improvement](#20-continual-improvement)
21. [Threat Intelligence](#21-threat-intelligence)
22. [Legal & Regulatory Register](#22-legal--regulatory-register)
23. [Statement of Applicability (SoA)](#23-statement-of-applicability-soa)
24. [Business Continuity & DR](#24-business-continuity--dr)
25. [Evidence Management](#25-evidence-management)
26. [Audit Trail](#26-audit-trail)
27. [Reports](#27-reports)
28. [Data Classification](#28-data-classification)
29. [Users & Access Management](#29-users--access-management)
30. [Settings](#30-settings)

---

## 1. Login

**Route:** `/login`  
**ISO 27001 Clause:** A.5.17 — Authentication Information, A.8.5 — Secure Authentication

### What It Contains
- Email and password fields
- JWT-based authentication (token stored in localStorage as `isms_token`)
- Role-based session: the token carries the user's role (Employee, Auditor, Manager, CISO, Admin, Super Admin)
- Auto-redirect to `/dashboard` on success; back to `/login` on 401 (expired token)

### Why It Was Added
Every ISMS platform must restrict access to authorized personnel only. ISO 27001 explicitly requires that information and systems are accessible only to those with a legitimate need. The login page is the enforcement gate — no unauthenticated user can reach any ISMS data.

### How It Is Used
- Users navigate to the platform URL and sign in with their registered credentials
- On successful login the JWT token is saved; all subsequent API calls use it as a Bearer token
- If the token expires mid-session, the global 401 handler clears the token and redirects back to this page automatically

---

## 2. Dashboard

**Route:** `/dashboard`  
**ISO 27001 Clause:** Clause 9 — Performance Evaluation (overview of the entire ISMS)

### What It Contains
- **8 stat cards (row 1):** Open Risks, Controls implemented/total, Open Incidents, Audits, Open CAPAs, Training Rate %, Active Policies, Total Assets
- **Charts:** Risk Trend (line), Compliance Gauge (circular score), Risk Heatmap (5×5 matrix), Control Status (donut), Incident Trend (bar)
- **Certification Readiness Score:** Composite score (0–100%) calculated from controls implemented, compliance score, active policies, training rate, and audits done — with a visual progress bar
- **Setup Checklist:** 8 onboarding steps (Scope defined → Controls imported → Risks registered → Policies created → Assets added → Compliance domains assigned → Training set up → Audit scheduled) each linking to the relevant page
- **Quick Actions:** 6 shortcut cards to the most commonly used pages

### Why It Was Added
The dashboard is the command center. An ISMS manager or CISO needs to see the health of the entire information security program at a single glance without opening 30 separate pages. The certification readiness score specifically tells the team how far they are from being audit-ready at any moment.

### How It Is Used
- Opened by default after login for Managers, CISOs, and Admins
- The Certification Readiness Score is checked regularly to track progress toward ISO 27001 certification
- The setup checklist guides organizations that are just starting their ISMS implementation
- Charts are used in management review meetings to present the current security posture

---

## 3. Context & ISMS Scope

**Route:** `/scope`  
**ISO 27001 Clause:** Clause 4.1 — Understanding the Organization, 4.2 — Interested Parties, 4.3 — ISMS Scope

### What It Contains
Each scope entry records:
- **Company Description** — Who the organization is
- **Internal Issues** — Culture, structure, resources, governance that affect the ISMS
- **External Issues** — Legal, regulatory, political, economic environment
- **Interested Party** — Stakeholders: customers, regulators, employees, suppliers
- **Their Requirements** — What each party expects from the organization
- **Scope Statement** — The formal boundary of the ISMS (locations, processes, systems included)
- **Exclusions** — Any ISO 27001 requirements excluded, with written justification

### Why It Was Added
ISO 27001 Clause 4 is mandatory and is the first thing an external auditor reviews. Before any controls or risks can be defined, the organization must formally state what the ISMS covers. Without a documented scope, the entire certification effort has no defined boundary and will fail the audit.

### How It Is Used
- Filled in once at the start of the ISMS implementation project
- The Scope Statement is referenced in the Statement of Applicability (SoA) and the Management Review
- Updated when the organization expands into new offices, systems, or services
- Interested parties and their requirements feed into the Risk Assessment (what risks matter to whom)

---

## 4. Risk Management

**Route:** `/risks`  
**ISO 27001 Clause:** Clause 6.1.2 — Information Security Risk Assessment, 6.1.3 — Risk Treatment

### What It Contains
Each risk record stores:
- **Title & Description** — What the risk is
- **Category** — Operational, Technical, Human, Legal, Physical, etc.
- **Likelihood** (1–5) and **Impact** (1–5) — Scored individually
- **Risk Score** — Auto-calculated: Likelihood × Impact (1–25)
- **Status** — Open, Accepted, Mitigated, Closed
- **Owner** — The person accountable for managing this risk
- **Treatment** — Accept, Mitigate, Transfer, Avoid
- **Mitigations** — Specific actions taken or planned
- **Due Date** — When treatment must be completed
- **Stats cards:** Total risks, Open, High/Critical (score ≥ 15), Avg risk score

### Why It Was Added
Risk assessment is the core of ISO 27001. Everything else — controls, policies, audits — exists because of identified risks. The standard requires the organization to identify information security risks, assess them systematically, and decide how to treat each one. This page is where that process lives in a structured, auditable format.

### How It Is Used
- The risk owner logs new risks as they are discovered (from incidents, audits, threat intelligence, or routine review)
- Likelihood and Impact are scored using a defined criteria table (not arbitrary guesses)
- The risk register is reviewed at least annually, and before major changes or incidents
- High-scoring risks (15+) must be linked to specific controls and treatment plans
- Risks feed into the SoA (which controls are needed) and the Management Review (what risks exist)
- The Risk Heatmap on the dashboard is populated from this data

---

## 5. Controls — Annex A

**Route:** `/controls`  
**ISO 27001 Clause:** Annex A — Reference Control Set (93 controls across 4 themes)

### What It Contains
Each control record stores:
- **Control Code** — e.g. A.5.1, A.8.7 (ISO 27001:2022 numbering)
- **Title** — Official control name
- **Description** — What the control requires
- **Category** — Organizational, People, Physical, Technological
- **Status** — Not Implemented, Planned, In Progress, Implemented
- **Owner** — Accountable person/team
- **Annex Reference** — Which Annex A section
- **Evidence** — Reference to evidence proving implementation
- A **"Seed Annex A" button** that pre-populates all 93 controls automatically
- **Stats cards:** Total, Implemented, In Progress, Not Implemented

### Why It Was Added
ISO 27001:2022 Annex A lists 93 controls that organizations must evaluate. For each control the organization must decide whether it is applicable (documented in the SoA), and if yes, implement it and provide evidence. This page is the master control register — the single source of truth for the implementation status of every Annex A control.

### How It Is Used
- On first setup, the "Seed Annex A" function imports all 93 controls pre-populated from the standard
- The CISO or security team assigns owners and sets initial status for each control
- As controls are implemented, the status is updated with links to evidence
- The SoA page links to this register to confirm which controls are applicable
- During an internal audit, auditors check this register to verify implementation claims
- The Control Status chart on the Dashboard reads from this data

---

## 6. Asset Inventory

**Route:** `/assets`  
**ISO 27001 Clause:** A.5.9 — Inventory of Information and Associated Assets, A.5.10 — Acceptable Use of Assets, A.5.11 — Return of Assets

### What It Contains
Each asset record stores:

**Identity:**
- Asset Tag (e.g. AST-001), Name, Description

**Classification:**
- Type — Hardware, Software, Data, People, Service, Cloud
- Classification — Public, Internal, Restricted, Confidential
- Criticality — Low, Medium, High, Critical
- Department / Business Unit

**Ownership:**
- Asset Owner (accountable person)
- Custodian (day-to-day manager)

**Technical Details:**
- Vendor / Manufacturer, Serial Number / License Key
- IP Address / Hostname, Version, Physical Location

**Lifecycle:**
- Purchase Date, End of Life Date, Last Review Date
- Status — Active, Inactive, Under Maintenance, Disposed
- Disposal Method — Secure Wipe, Physical Destruction, Return to Vendor, etc.
- Notes

**Table view:** Simplified 8-column table with color-coded classification, criticality, and status pills  
**Detail Panel:** Click any row to open a full slide-over panel showing all details organized by section, with smart warnings (EoL within 90 days shown in red, overdue reviews in orange)  
**Stats cards:** Total, Hardware count, Software count, Confidential, EoL in 90 days, Review Overdue

### Why It Was Added
You cannot secure what you do not know you have. ISO 27001 requires a complete, maintained inventory of all assets that fall within the ISMS scope. Each asset must have a designated owner who is accountable for its security. Without an asset register, risk assessments are incomplete, controls cannot be properly assigned, and auditors will immediately flag it as a major non-conformity.

### How It Is Used
- Every physical device, software application, data store, cloud service, and people role within the ISMS scope is registered here
- Asset owners use the detail panel to review their assets' lifecycle status and keep records current
- The EoL warning helps IT plan hardware replacement or software license renewals before assets become a vulnerability
- The Review Overdue count reminds owners that assets not reviewed in over 365 days need reassessment
- Confidential classification drives which controls apply (encryption, access control, clean desk)
- During an ISO 27001 audit, this register is presented as evidence that A.5.9 is satisfied

---

## 7. Incident Management

**Route:** `/incidents`  
**ISO 27001 Clause:** A.5.24 — Planning and Preparation for Information Security Incident Management, A.5.25 — Assessment, A.5.26 — Response, A.5.27 — Learning from Incidents, A.5.28 — Collection of Evidence

### What It Contains
Each incident record stores:
- **Title & Description** — What happened
- **Category** — Data Breach, Malware, Phishing, Unauthorized Access, System Failure, Physical, etc.
- **Severity** — Low, Medium, High, Critical
- **Status** — Open, Investigating, Resolved, Closed
- **Reporter** — Who reported the incident
- **Assignee** — Who is handling it
- **Root Cause** — Analysis of why it happened
- **Resolution** — What was done to resolve it
- **Reported At** / **Resolved At** — Timestamps for response time calculation
- **Stats cards:** Total, Open, Critical, Resolved

### Why It Was Added
ISO 27001 requires a formal incident management process. Every security event must be recorded, assessed for severity, investigated, resolved, and learned from. Without structured incident tracking, repeated incidents cannot be identified, response times cannot be measured, and the organization cannot demonstrate to auditors that it handles security events systematically.

### How It Is Used
- Anyone in the organization can report an incident; the security team takes ownership and assigns an investigator
- The status moves from Open → Investigating → Resolved → Closed as the response progresses
- Root cause analysis is mandatory before closing — it feeds into CAPA (corrective action)
- Resolved incidents provide lessons-learned that update training and controls
- Incident history is reviewed in the Management Review meeting
- Evidence collected during incidents is stored in the Evidence Management page

---

## 8. Policies & Documents

**Route:** `/policies`  
**ISO 27001 Clause:** A.5.1 — Policies for Information Security, Clause 7.5 — Documented Information

### What It Contains
Each policy record stores:
- **Title** — Policy name (e.g. Information Security Policy, Acceptable Use Policy)
- **Version** — e.g. 1.0, 2.1
- **Status** — Draft, Under Review, Approved, Retired
- **Category** — Security, HR, IT, Legal, Operational
- **Content** — Full policy text
- **Approver** — Who approved the policy
- **Approved At** — Approval date
- **Review Date** — When it must next be reviewed

### Why It Was Added
Policies are the foundation of any ISMS. ISO 27001 Clause 5.2 requires top management to establish an information security policy. Beyond the top-level policy, Annex A requires additional specific policies for areas like access control, cryptography, acceptable use, and incident management. Without documented and approved policies, the organization has no formal rules to enforce, no baseline for auditing, and no way to demonstrate commitment to information security.

### How It Is Used
- The CISO or legal/compliance team creates policies in Draft status
- They are reviewed by stakeholders, then approved by top management
- Approved policies are distributed to staff (linked to training)
- Policies are reviewed at minimum annually (before the Review Date)
- When a policy becomes outdated, it moves to Retired status
- Auditors check that policies exist, are approved, are current, and are communicated to employees

---

## 9. Training Records

**Route:** `/training`  
**ISO 27001 Clause:** A.6.3 — Information Security Awareness, Education and Training, Clause 7.2 — Competence, Clause 7.3 — Awareness

### What It Contains
Each training record stores:
- **Title** — Training program name
- **Type** — Internal, External, E-Learning, Workshop, Certification
- **Assignee** — Who must complete this training
- **Status** — Planned, In Progress, Completed, Overdue
- **Due Date** — Completion deadline
- **Completed At** — Actual completion date
- **Score** — Test/assessment score if applicable
- **Stats cards:** Total, Completed, In Progress/Overdue, Completion rate %

### Why It Was Added
ISO 27001 requires that all staff whose work affects information security are competent and aware of security requirements. Training is not optional — it is a mandatory control. Unaware employees are consistently the leading cause of security incidents (phishing, weak passwords, mishandling of data). The training register provides the documented evidence that the organization is meeting this obligation.

### How It Is Used
- HR or the security team creates training assignments for new joiners and annually for all staff
- Mandatory training topics include: Information Security Awareness, Acceptable Use, Phishing, Data Protection (GDPR), and role-specific technical training
- Completion is tracked and the rate is shown on the Dashboard
- Overdue training triggers a follow-up to the assignee's manager
- Training completion records are presented to auditors as evidence of A.6.3 compliance
- The Security Awareness module (page 10) is the interactive counterpart to this log

---

## 10. Security Awareness

**Route:** `/security-awareness`  
**ISO 27001 Clause:** A.6.3 — Information Security Awareness, Education and Training

### What It Contains
Three sub-pages:

**Course Catalog (`/security-awareness`):**
- List of interactive awareness courses (Phishing, Password Security, Social Engineering, Data Protection, Incident Reporting, Clean Desk)
- Each course card shows: title, description, duration, difficulty level, and completion status for the current user
- A progress bar showing how many courses the user has completed

**Course Player (`/security-awareness/[courseId]`):**
- Multi-step interactive course content with lessons, quizzes, and scenario-based questions
- Score calculation on completion
- Progress saved to `AwarenessProgress` table with employee name, department, course ID, score, and completion date

**Progress Dashboard (`/security-awareness/progress`):**
- Management view of all employees' awareness completion status
- Grouped by department, course, and score

### Why It Was Added
Reading a policy document is not sufficient evidence of awareness. ISO 27001 requires that employees actually understand and can apply security concepts. Interactive courses with scored assessments provide measurable proof of awareness. This also shifts security training from a passive "email attachment" exercise to an engaging, verifiable activity that creates real behavioral change.

### How It Is Used
- All employees are assigned to complete the full course catalog on joining
- Refresher courses are assigned annually or after a relevant incident
- Managers use the Progress dashboard to see which staff are behind
- Scores and completion dates are saved as evidence for auditors
- The Training Records page (page 9) tracks the formal assignment; this page is the actual delivery mechanism

---

## 11. Audits

**Route:** `/audits`  
**ISO 27001 Clause:** Clause 9.2 — Internal Audit

### What It Contains
Each audit record stores:
- **Title** — Audit name (e.g. Q2 2026 Internal Audit)
- **Type** — Internal, External, Surveillance, Certification, Supplier
- **Auditor** — Lead auditor name
- **Scope** — What is being audited (systems, processes, departments)
- **Status** — Planned, In Progress, Completed, Closed
- **Findings** — Documented nonconformities, observations, and opportunities for improvement
- **Start Date / End Date** — Audit schedule
- **Stats cards:** Total, Planned, In Progress, Completed

### Why It Was Added
ISO 27001 Clause 9.2 mandates that organizations conduct internal audits at planned intervals to verify that the ISMS conforms to requirements and is effectively implemented. Internal audits are also the main preparation mechanism for external certification audits. Without a formal audit record, the organization cannot demonstrate that it reviews its own ISMS systematically.

### How It Is Used
- The security team plans internal audits at minimum annually (many organizations do quarterly)
- Each audit is scoped to specific controls, departments, or processes
- Findings are categorized as: Major Nonconformity, Minor Nonconformity, or Observation
- Major nonconformities must be addressed via CAPA (page 19) before the certification audit
- Completed audits and their findings are reviewed in the Management Review (page 17)
- External auditors from the certification body will ask to see audit records and follow-up evidence

---

## 12. Vendor Management

**Route:** `/vendors`  
**ISO 27001 Clause:** A.5.19 — Information Security in Supplier Relationships, A.5.20 — Addressing Security in Supplier Agreements, A.5.21 — Managing Security in ICT Supply Chain, A.5.22 — Monitoring and Review of Supplier Services

### What It Contains
Each vendor record stores:
- **Name** — Supplier/vendor name
- **Service** — What they provide (cloud hosting, software, payroll, legal)
- **Risk Level** — Low, Medium, High, Critical
- **Status** — Active, Under Review, Terminated
- **Contact** — Primary contact person
- **Email** — Contact email
- **Contract** — Contract reference or number
- **Review Date** — Next scheduled security review
- **Stats cards:** Total vendors, High Risk count, Active, Review Due

### Why It Was Added
Third-party vendors are one of the biggest risks in modern information security. Many major breaches originate from a compromised supplier (SolarWinds, MOVEit, etc.). ISO 27001 Annex A requires that security requirements are included in supplier contracts and that supplier services are regularly reviewed. Without a vendor register, the organization has no visibility into who has access to its systems or data.

### How It Is Used
- Every vendor with access to organizational systems, data, or facilities is registered
- Risk Level is assigned based on: what data they access, what systems they touch, and how critical their service is
- High-risk vendors require formal security assessments, signed Data Processing Agreements (for GDPR), and regular review
- The Review Date triggers annual (or more frequent) security reviews
- When a vendor is terminated, their access is revoked and the record updated
- Auditors check the vendor register and ask to see evidence of security clauses in contracts

---

## 13. Compliance Register

**Route:** `/compliance`  
**ISO 27001 Clause:** A.5.31 — Legal, Statutory, Regulatory and Contractual Requirements, Clause 6.1.3 — Compliance with Legal Requirements

### What It Contains
Each compliance record stores:
- **Clause** — Reference number or domain (e.g. GDPR Art. 32, ISO 27001 §5.2)
- **Requirement** — Description of what must be met
- **Status** — Not Started, In Progress, Compliant, Non-Compliant, Partially Compliant
- **Evidence** — Reference to proof of compliance
- **Owner** — Person accountable for this requirement
- **Notes** — Additional context
- **Stats cards:** Total requirements, Compliant count, Non-Compliant, Compliance score %

### Why It Was Added
Organizations must comply with multiple overlapping frameworks simultaneously: ISO 27001, GDPR, NIS2, sector-specific regulations, and contractual obligations. Without a centralized compliance register, requirements are missed, duplicated work happens across teams, and the organization cannot demonstrate the full picture of its compliance posture to auditors, customers, or regulators.

### How It Is Used
- The legal/compliance team populates this register with all applicable requirements at the start of the ISMS program
- Each requirement is assigned an owner who is responsible for implementing and evidencing compliance
- Status is updated as controls are implemented and evidence is collected
- The compliance score feeds into the Dashboard's Certification Readiness Score
- During an ISO 27001 audit, this register demonstrates that the organization has identified and addressed all applicable legal requirements (a specific ISO 27001 requirement under Annex A.5.31)

---

## 14. Objectives

**Route:** `/objectives`  
**ISO 27001 Clause:** Clause 6.2 — Information Security Objectives and Planning to Achieve Them

### What It Contains
Each objective record stores:
- **Title** — The objective (e.g. "Reduce phishing click rate to <5%")
- **Description** — Detailed explanation of the goal
- **Target** — Measurable target value or outcome
- **Progress** — 0–100% completion slider
- **Owner** — Accountable person
- **Status** — Active, Achieved, On Hold, Cancelled
- **Deadline** — Target achievement date
- **Stats cards:** Total, Active, Achieved, Avg progress %

### Why It Was Added
ISO 27001 Clause 6.2 explicitly requires that organizations establish measurable information security objectives at relevant functions and levels. Objectives must be monitored, communicated, and updated. Without defined and tracked objectives, the ISMS has no direction and there is no way to demonstrate "continual improvement" — which is one of the core principles of the standard.

### How It Is Used
- The CISO and management team set security objectives annually (aligned to risks and the organization's strategy)
- Objectives must be SMART: Specific, Measurable, Achievable, Relevant, Time-bound
- Examples: "Implement MFA for all admin accounts by Q3", "Achieve 100% staff awareness completion by year-end", "Reduce mean time to detect incidents to <4 hours"
- Progress is updated quarterly (or when milestones are reached)
- Objectives are reviewed in the Management Review meeting
- Achieved objectives are evidence of continual improvement — one of ISO 27001's core requirements

---

## 15. Leadership & Roles

**Route:** `/leadership`  
**ISO 27001 Clause:** Clause 5.1 — Leadership and Commitment, Clause 5.3 — Organizational Roles, Responsibilities and Authorities, A.5.2 — Information Security Roles and Responsibilities

### What It Contains
Each leadership record stores:
- **Role** — e.g. CISO, Information Security Manager, Risk Owner, Data Protection Officer
- **Assignee** — The person filling the role
- **Responsibilities** — What this role is accountable for
- **Commitment** — How this person demonstrates leadership commitment
- **Authority** — Strategic, Operational, or Advisory
- **Policy Reference** — Which policy defines this role
- **Stats cards:** Total roles, Strategic roles, Operational roles, unique assignees

### Why It Was Added
ISO 27001 Clause 5 requires top management to demonstrate visible leadership and commitment to the ISMS. Critically, roles and responsibilities must be documented and assigned — not assumed. Without a formal roles register, there is no accountability structure. During an audit, if "who is responsible for information security?" cannot be answered with a named person, it is a nonconformity.

### How It Is Used
- Populated at the start of the ISMS program by the sponsoring executive and CISO
- Every risk, control, asset, and incident must have an owner — this register defines who those owners can be
- Referenced in the Management Review as evidence that top management is engaged
- Updated when organizational changes occur (people leave, new roles created)
- DPO, CISO, and security team roles are often of direct interest to certification body auditors

---

## 16. Change Management

**Route:** `/changes`  
**ISO 27001 Clause:** A.8.32 — Change Management, Clause 8.1 — Operational Planning and Control

### What It Contains
Each change record stores:
- **Title** — What is being changed
- **Description** — Full detail of the change
- **Type** — Standard, Emergency, Major, Minor
- **Status** — Requested, Under Review, Approved, Implemented, Rejected, Rolled Back
- **Requester** — Who requested the change
- **Impact** — Security/operational impact assessment
- **Approver** — Who approved it
- **Approved At / Implemented At** — Key timestamps
- **Stats cards:** Total changes, Pending approval, Approved, Implemented

### Why It Was Added
Uncontrolled changes are a leading cause of security incidents and outages. A misconfigured firewall rule, an untested software update, or an emergency server change made without documentation can introduce vulnerabilities. ISO 27001 Annex A control A.8.32 requires that changes to information systems follow a formal process. This page provides that documented process — ensuring changes are assessed for security impact, approved, and tracked.

### How It Is Used
- Any change to systems, infrastructure, or processes within the ISMS scope is submitted here before implementation
- Emergency changes (made outside normal hours due to a crisis) are still recorded after the fact
- The security team reviews changes for potential impact on confidentiality, integrity, or availability
- Approved changes are handed to the implementation team; unapproved changes must not proceed
- Post-implementation the record is updated to "Implemented" or "Rolled Back" with results noted
- Change records are reviewed in audits to verify that A.8.32 is being followed

---

## 17. Management Review

**Route:** `/management-review`  
**ISO 27001 Clause:** Clause 9.3 — Management Review

### What It Contains
Each review record stores:
- **Review Date** — When the review meeting was held
- **Attendees** — Who participated (must include top management)
- **Agenda** — Topics covered
- **Review Inputs** — Status of previous actions, audit findings, incidents, risk changes, nonconformities, objectives progress, stakeholder feedback, opportunities for improvement
- **Review Outputs** — Decisions made during the review
- **Decisions** — Formal decisions documented
- **Action Items** — Follow-up tasks assigned with owners and dates
- **Status** — Scheduled, Completed, Cancelled
- **Stats cards:** Total reviews, Completed, Scheduled, Action items count

### Why It Was Added
ISO 27001 Clause 9.3 mandates that top management reviews the ISMS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness. This is not optional. The management review is the mechanism by which the organization demonstrates that leadership is actively engaged in the ISMS — not just a rubber-stamp exercise. Auditors always inspect management review records and minutes.

### How It Is Used
- Conducted at minimum annually (most certified organizations do it semi-annually or quarterly)
- The CISO prepares the inputs (risks, incidents, audit findings, compliance status, training rate) from data across all modules
- Top management reviews this data, makes decisions, and assigns action items
- The review minutes are the output record — stored here as evidence
- Action items from the review are tracked to completion and verified in the next review
- This review feeds directly into the Continual Improvement page (page 20)

---

## 18. Communication Plan

**Route:** `/communication`  
**ISO 27001 Clause:** Clause 7.4 — Communication

### What It Contains
Each communication record stores:
- **Topic** — What is being communicated (e.g. security alerts, policy updates, training reminders)
- **Audience** — Who receives the communication (all staff, IT team, management)
- **Method** — Email, Intranet, Meeting, Notice Board, etc.
- **Frequency** — Ad-hoc, Weekly, Monthly, Quarterly, Annually
- **Owner** — Responsible communicator
- **Record** — Reference to where communication records are kept
- **Status** — Ongoing, Completed, Planned
- **Stats cards:** Active communications, Methods in use, Owners count

### Why It Was Added
ISO 27001 Clause 7.4 requires the organization to determine what needs to be communicated about the ISMS, to whom, when, and by what method — and to keep records of this. Communication is not just sending emails — it is a planned, structured process. Without a communication plan, important security information (new policies, incident alerts, training deadlines) does not reliably reach the right people.

### How It Is Used
- The CISO or communications lead maps out all regular ISMS communications at the start of the year
- Examples: Monthly security newsletter to all staff; Quarterly risk status update to board; Annual policy acknowledgement campaign; Immediate incident alerts to IT team
- The record field links to email archives, intranet posts, or meeting minutes that prove the communication happened
- Auditors check this plan to verify that the organization has a systematic, documented communication process

---

## 19. CAPA — Corrective & Preventive Actions

**Route:** `/capa`  
**ISO 27001 Clause:** Clause 10.1 — Nonconformity and Corrective Action

### What It Contains
Each CAPA record stores:
- **Title** — Summary of the action
- **Type** — Corrective (fixing something that went wrong) or Preventive (preventing a future problem)
- **Description** — Full detail of the nonconformity or risk
- **Root Cause** — Why did it happen (5-Whys analysis recommended)
- **Action** — Specific steps taken or planned to resolve it
- **Status** — Open, In Progress, Closed, Verified
- **Owner** — Accountable person
- **Due Date / Closed At** — Timeline tracking
- **Stats cards:** Total CAPAs, Open, Closed, Overdue (past due date)

### Why It Was Added
ISO 27001 Clause 10.1 is one of the most-tested requirements in an audit. When a nonconformity is found — whether from an internal audit, incident, or management review — the organization must react to it, investigate root causes, take corrective action, and verify that the action was effective. CAPA is the formal mechanism for doing this in a documented, traceable way. Without it, the same problems recur and the standard's "continual improvement" requirement cannot be met.

### How It Is Used
- A CAPA is opened whenever an audit finding, incident, compliance failure, or management review action item requires formal corrective action
- Root cause analysis is mandatory — the action must address the cause, not just the symptom
- The CISO monitors open CAPAs and escalates those approaching their due date
- Closed CAPAs require verification evidence (evidence that the action worked)
- The open CAPA count is shown on the Dashboard and reviewed in Management Reviews
- Recurring CAPAs on the same topic signal a systemic problem that needs a more fundamental fix

---

## 20. Continual Improvement

**Route:** `/improvement`  
**ISO 27001 Clause:** Clause 10.2 — Continual Improvement

### What It Contains
Each improvement record stores:
- **Source** — Where the improvement idea came from: Audit Finding, Incident, Management Review, Risk Assessment, Employee Suggestion, Benchmarking
- **Description** — What improvement is proposed
- **Owner** — Responsible person
- **Priority** — Low, Medium, High
- **Status** — Open, In Progress, Implemented, Rejected
- **Benefits** — Expected outcome of the improvement
- **Due Date** — Target implementation date
- **Stats cards:** Total, Open, Implemented, High Priority count

### Why It Was Added
ISO 27001 is not a "get certified and forget it" standard. Clause 10.2 requires that the organization continually improves the suitability, adequacy, and effectiveness of the ISMS. This means proactively capturing improvement opportunities — not just fixing problems when they arise, but seeking ways to make security better over time. This page provides the structured log to demonstrate this ongoing commitment.

### How It Is Used
- Ideas come from many sources: audit findings (converted from CAPAs), incidents, benchmarking against industry, employee suggestions, or management review outputs
- The security team reviews open improvements monthly and assigns priorities
- Implemented improvements are recorded with the actual benefit achieved — closing the loop
- The improvement history is one of the strongest pieces of evidence the organization can present to an auditor for "continual improvement"
- Rejected improvements are also recorded with the reason — showing the decision process was deliberate

---

## 21. Threat Intelligence

**Route:** `/threats`  
**ISO 27001 Clause:** A.5.7 — Threat Intelligence

### What It Contains
Each threat record stores:
- **Title** — Threat name (e.g. "Ransomware targeting healthcare sector")
- **Source** — Where the intelligence came from (CERT, vendor advisory, OSINT, internal observation)
- **Description** — Details about the threat
- **Severity** — Low, Medium, High, Critical
- **Relevance** — High, Medium, Low relevance to the organization
- **Linked Risks** — Which risk register entries this threat informs
- **Linked Controls** — Which Annex A controls address this threat
- **Status** — Active, Monitoring, Mitigated, Resolved
- **Stats cards:** Total threats, Active, Critical/High severity, Linked to risks

### Why It Was Added
ISO 27001:2022 introduced Annex A control A.5.7 (Threat Intelligence) as a new requirement — not present in the 2013 version. Organizations must now collect, analyze, and act on threat intelligence relevant to their environment. Reacting to threats after they hit is too late; proactive intelligence allows the organization to update controls and risks before an attack occurs.

### How It Is Used
- The security team monitors threat intelligence feeds (CERTs, vendor advisories, news, ISACs)
- Relevant threats are logged here with their severity and relevance to the organization
- Threats are linked to existing risk entries to elevate those risks' likelihood scores
- Threats are linked to controls that should mitigate them — helping prioritize control implementation
- A new threat with no linked control may trigger the creation of a new control or risk entry
- The threat register is reviewed in Management Reviews and during risk reassessment cycles

---

## 22. Legal & Regulatory Register

**Route:** `/legal`  
**ISO 27001 Clause:** A.5.31 — Legal, Statutory, Regulatory and Contractual Requirements, A.5.34 — Privacy and Protection of PII

### What It Contains
Each legal requirement record stores:
- **Title** — Name of the law, regulation, or contractual requirement
- **Category** — Law, Regulation, Standard, Contract, Directive
- **Jurisdiction** — EU, UK, US, Global, National, etc.
- **Applicability** — Fully Applicable, Partially Applicable, Not Applicable
- **Owner** — Responsible person/team
- **Status** — Compliant, Non-Compliant, Under Review, Partially Compliant
- **Evidence** — Reference to compliance proof
- **Review Date** — When this requirement must be re-assessed
- **Stats cards:** Total requirements, Compliant, Non-Compliant, Review Due

### Why It Was Added
Organizations operating in regulated industries (healthcare, finance, public sector) or in multiple jurisdictions face overlapping legal obligations. GDPR, NIS2, HIPAA, PCI-DSS, national data protection laws — each imposes specific security requirements. This page provides the dedicated register for tracking legal and regulatory compliance separately from the general compliance register (which covers ISO clauses) and with jurisdiction-level detail.

### How It Is Used
- Legal and compliance teams populate this register with all applicable laws and regulations
- Each entry is assessed for applicability — not every law applies to every organization
- The Owner ensures that controls are in place to meet the legal requirement
- Review Dates are set to revisit requirements when laws change (e.g., GDPR amendments, new NIS2 implementing regulations)
- This register is a required input to the ISO 27001 audit — auditors verify that the organization has identified all applicable legal requirements (Annex A.5.31)
- Non-compliant entries trigger CAPAs (page 19) to address the gap

---

## 23. Statement of Applicability (SoA)

**Route:** `/soa`  
**ISO 27001 Clause:** Clause 6.1.3(d) — Statement of Applicability

### What It Contains
Each SoA entry records:
- **Control ID** — e.g. A.5.1, A.8.7 (all 93 ISO 27001:2022 Annex A controls)
- **Control Name** — Official title of the control
- **Applicable** — Yes or No
- **Justification** — Mandatory written reason for the applicability decision
- **Implementation Status** — Not Started, Planned, In Progress, Implemented
- **Linked Risks** — Which risks make this control necessary
- **Evidence** — Reference to documented proof of implementation
- **Stats cards:** Total 93 controls, Applicable count, Not Applicable count, Implemented count

### Why It Was Added
The Statement of Applicability is one of the most important mandatory documents in ISO 27001. Clause 6.1.3 specifically requires it. The SoA is the definitive document that declares which of the 93 Annex A controls the organization has determined to be applicable (and why), which are not applicable (and why), and the current implementation status. Without the SoA, an organization cannot be certified — it is a non-negotiable audit deliverable.

### How It Is Used
- Created once based on the risk assessment results and organizational context
- For each of the 93 controls: if the risk assessment showed a risk that the control addresses → mark Applicable with justification
- Controls can be marked Not Applicable with written justification (e.g. "A.7.4 Physical security monitoring — not applicable as we are a fully remote organization")
- As controls are implemented, status is updated from Not Started → Implemented
- Evidence links confirm to auditors that implementation is real, not just claimed
- The SoA is formally reviewed and updated annually or after significant changes
- The certification body auditor will test a sample of the SoA entries against actual evidence during the Stage 2 audit

---

## 24. Business Continuity & DR

**Route:** `/bcp`  
**ISO 27001 Clause:** A.5.29 — Information Security During Disruption, A.5.30 — ICT Readiness for Business Continuity

### What It Contains
Each BCP/DR plan record stores:
- **Plan Name** — e.g. IT Disaster Recovery Plan, Business Continuity Plan
- **Type** — DR Plan, BCP, Crisis Plan, Pandemic Plan
- **Owner** — Responsible person
- **Critical Services** — Services covered by this plan
- **RTO** — Recovery Time Objective (e.g. "4 hours") — maximum downtime tolerated
- **RPO** — Recovery Point Objective (e.g. "1 hour") — maximum data loss tolerated
- **Dependencies** — External systems or services this plan relies on
- **Last Test Date** — When the plan was last tested
- **Test Result** — Passed, Failed, Partial, Not Tested
- **Improvements** — What was learned from the test and needs to be improved
- **Stats cards:** Total plans, Active plans, Not Tested count, RTO values

### Why It Was Added
ISO 27001:2022 Annex A controls A.5.29 and A.5.30 require that the organization plans for information security continuity during adverse situations and that ICT systems can be recovered. A major incident — ransomware, data center fire, key personnel unavailability — can destroy a business that has no recovery plan. The BCP/DR page provides the structured documentation to plan, test, and continuously improve recovery capabilities.

### How It Is Used
- The IT and business continuity teams create a plan for each critical service or system
- RTO and RPO are agreed with business stakeholders — they define the recovery target that drives the technical design
- Plans must be tested at minimum annually; certification auditors will ask for test evidence
- "Not Tested" plans are flagged in the stats — untested plans provide false confidence
- After each test, Improvements are documented and tracked to resolution
- During an actual incident, the relevant plan is activated and the team follows it step-by-step
- The Last Test Date and Test Result are the key data points auditors check during an ISO 27001 audit for A.5.30

---

## 25. Evidence Management

**Route:** `/evidence`  
**ISO 27001 Clause:** Clause 7.5 — Documented Information (Evidence as documented proof of control implementation)

### What It Contains
Each evidence record stores:
- **Title** — Descriptive name (e.g. "Firewall Configuration Q1 2026")
- **Type** — Document, Screenshot, Certificate, Log, Configuration, Report, Other
- **Link To** — Which module this evidence relates to: Control, Risk, Audit, Incident, Policy, CAPA, Vendor
- **Reference ID** — Specific record reference (e.g. A.8.7, RSK-003, AUD-001)
- **Tags** — Comma-separated tags for searchability (e.g. firewall, network, Q1-2026)
- **Description** — Explanation of what this evidence proves
- **File Upload** — Actual file attached (PDF, DOCX, PNG, etc.) stored on the server (max 10MB)
- **File Download** — Direct link to download the stored file
- **Stats cards:** Total evidence items, items with files, linked items, unique tags used

### Why It Was Added
Evidence is what turns claims into proof. Every implemented control, every compliance statement, every closed CAPA — without evidence they are just words. ISO 27001 auditors do not accept verbal assurances; they require documented proof. The Evidence Management page centralizes all proof documents in one place, linked to the specific records they support. This is the difference between failing and passing an audit.

### How It Is Used
- After implementing a control, the responsible person uploads evidence (screenshots, configuration exports, signed documents, certificates)
- Evidence is tagged and linked to the specific control code (e.g. A.8.7 for malware protection)
- When an incident is investigated, relevant logs are uploaded as evidence
- Before an audit, the CISO can quickly pull all evidence for a given control by filtering the register
- Auditors are given access to this register (or a printed export) to verify claims
- Old evidence is retained to show the history of implementation (not deleted even when replaced)

---

## 26. Audit Trail

**Route:** `/audit-trail`  
**ISO 27001 Clause:** A.8.15 — Logging, A.8.17 — Clock Synchronization, Clause 9.1 — Monitoring

### What It Contains
Every data-changing operation in the platform is automatically logged:
- **User Email** — Who performed the action
- **Action** — CREATE, UPDATE, or DELETE
- **Module** — Which part of the system (risks, controls, assets, incidents, etc.)
- **Record ID & Name** — Exactly which record was affected
- **Old Values** — The data before the change (JSON)
- **New Values** — The data after the change (JSON)
- **IP Address** — Where the request came from
- **Timestamp** — Exact date and time

The page provides a read-only filterable log (no editing or deleting).

### Why It Was Added
ISO 27001 Annex A control A.8.15 requires that event logs are produced, protected, and reviewed. For an ISMS platform, the audit trail is essential for two reasons: (1) accountability — every change to critical security data is traceable to a specific person, and (2) forensics — if data is incorrectly changed or deleted, the original values can be retrieved. A system with no audit log offers no accountability and no recovery path.

### How It Is Used
- Automatically populated by the backend — no manual entry required
- The security team or CISO reviews the trail periodically and after any suspicious activity
- If a risk record is unexpectedly deleted, the audit trail shows who deleted it and when
- Auditors review the trail to verify that the system is being actively used and that changes are controlled
- The "Old Values" JSON allows rollback of accidental changes
- Access to the audit trail page is restricted to Admins and above in the RBAC system

---

## 27. Reports

**Route:** `/reports`  
**ISO 27001 Clause:** Clause 9.1 — Monitoring, Measurement, Analysis and Evaluation

### What It Contains
- Pre-built report templates for the main ISMS modules (Risks, Controls, Incidents, Compliance, Assets, Training)
- Export options: CSV (for data analysis in Excel) and PDF (for formal reporting)
- Summary statistics per module
- Printable view with the organization's information

### Why It Was Added
Data without reports is just a database. Management, the board, regulators, and auditors need formatted, printable summaries of the ISMS status. ISO 27001 Clause 9.1 requires that monitoring and measurement results be documented and communicated. The reports page provides the mechanism to produce formal, shareable outputs without manual data extraction.

### How It Is Used
- CISO uses reports to brief the board on quarterly security posture
- Compliance team generates reports for regulators on demand
- Audit preparation: generate full CSV/PDF exports of the risk register, control status, and incident log for the certification body
- Individual page export buttons (CSV/PDF) are available on each module page for targeted exports
- Management Review meeting inputs are generated from these reports

---

## 28. Data Classification

**Route:** `/classification`  
**ISO 27001 Clause:** A.5.12 — Classification of Information, A.5.13 — Labelling of Information, A.5.14 — Information Transfer

### What It Contains
- Classification policy and scheme definition
- Classification levels and their meaning: Public, Internal, Restricted, Confidential
- Handling rules for each classification level
- Examples of what data belongs in each category
- Reference to the Asset Inventory classification field

### Why It Was Added
ISO 27001 Annex A controls A.5.12 and A.5.13 require that information is classified according to its sensitivity and that classification is consistently applied. Without a defined classification scheme, employees make arbitrary decisions about how to handle data — leading to confidential data being shared inappropriately or over-classified data creating unnecessary friction. Classification is also the basis for applying appropriate technical controls (encryption for Confidential, public access for Public).

### How It Is Used
- Defined once at the start of the ISMS program by the CISO and legal team
- Communicated to all staff via security awareness training
- Applied to the Asset Inventory — every asset has a classification field
- Applied to the Policies & Documents page — policies are classified by their sensitivity
- Drives technical controls: Confidential data must be encrypted at rest and in transit, access-controlled, and audit-logged
- Referenced in the SoA when justifying controls related to access control and information handling

---

## 29. Users & Access Management

**Route:** `/users`  
**ISO 27001 Clause:** A.5.16 — Identity Management, A.5.17 — Authentication Information, A.5.18 — Access Rights, A.8.2 — Privileged Access Rights

### What It Contains
Each user record stores:
- **First Name / Last Name / Email** — Identity
- **Role** — One of 6 RBAC roles (Employee, Auditor, Manager, CISO, Admin, Super Admin)
- **Organization** — Which organization/tenant
- **Status** — Active, Suspended, Inactive
- **MFA Enabled** — Whether Multi-Factor Authentication is active
- **Last Login** — When they last accessed the platform
- **Password** — Hashed and stored securely (bcrypt), never shown in UI

**Role Permission Matrix (RBAC):**
| Role | Read | Write | Delete | Admin |
|------|------|-------|--------|-------|
| Employee | Own modules | No | No | No |
| Auditor | All modules | No | No | No |
| Manager | Most modules | Yes | Limited | No |
| CISO | All modules | Yes | Yes | No |
| Admin | All modules | Yes | Yes | User mgmt |
| Super Admin | All modules | Yes | Yes | Full access |

### Why It Was Added
ISO 27001 Annex A control A.5.18 requires that access rights are provisioned, reviewed, modified, and removed based on the principle of least privilege — users should only have access to what they need for their role. The Users page is the platform's identity and access management system. Without proper RBAC, a junior employee could delete risk records or modify compliance data, destroying the integrity of the ISMS.

### How It Is Used
- Admins create user accounts when new staff join; accounts are deactivated when staff leave
- Roles are assigned based on job function — an internal auditor gets the Auditor role (read-only), a CISO gets full access
- Access rights are reviewed at minimum annually and whenever someone changes role
- Suspended status is used when an employee is under investigation or on extended leave
- MFA is enforced for all high-privilege roles (CISO, Admin, Super Admin)
- The user list and last-login data are presented to auditors as evidence of A.5.18 access rights management

---

## 30. Settings

**Route:** `/settings`  
**ISO 27001 Clause:** A.5.1 — Policies for Information Security (platform-level configuration)

### What It Contains
- **Organization Name** — Displayed throughout the platform
- **Primary Contact** — Security contact details
- **Risk Scoring Method** — Likelihood × Impact (5×5) matrix configuration
- **Notification Preferences** — Email alerts for overdue items, new incidents, etc.
- **Theme** — Light/Dark mode
- **API Keys** — Integration configuration (if applicable)
- **Backup & Export** — Full data export option
- **Platform Version** — Current software version

### Why It Was Added
Platform configuration must be centralized and restricted to administrators. Organization-specific settings (company name, scoring methodology, notification thresholds) ensure the platform is tailored to the organization's context. Some settings (like the risk scoring matrix) directly affect how risk scores are calculated — so they must be change-controlled and administrator-only.

### How It Is Used
- Configured once by the Super Admin during initial platform setup
- Organization name is used in PDF report headers and email notifications
- Risk scoring method is agreed with the risk management team and locked in here
- Notification preferences ensure that the right people are alerted to overdue items (e.g., CAPAs past due, review dates approaching)
- Access is restricted to Admin and Super Admin roles only

---

## Summary: ISO 27001:2022 Clause Coverage

| Platform Page | ISO 27001 Clause / Annex A |
|---|---|
| Login | A.5.17, A.8.5 |
| Dashboard | Clause 9 (Performance Evaluation) |
| Scope | Clause 4.1, 4.2, 4.3 |
| Risk Management | Clause 6.1.2, 6.1.3 |
| Controls (Annex A) | Annex A (all 93 controls) |
| Asset Inventory | A.5.9, A.5.10, A.5.11 |
| Incident Management | A.5.24–A.5.28 |
| Policies | A.5.1, Clause 7.5 |
| Training | A.6.3, Clause 7.2, 7.3 |
| Security Awareness | A.6.3 |
| Audits | Clause 9.2 |
| Vendor Management | A.5.19–A.5.22 |
| Compliance Register | A.5.31, Clause 6.1.3 |
| Objectives | Clause 6.2 |
| Leadership & Roles | Clause 5.1, 5.3, A.5.2 |
| Change Management | A.8.32, Clause 8.1 |
| Management Review | Clause 9.3 |
| Communication Plan | Clause 7.4 |
| CAPA | Clause 10.1 |
| Continual Improvement | Clause 10.2 |
| Threat Intelligence | A.5.7 |
| Legal Register | A.5.31, A.5.34 |
| Statement of Applicability | Clause 6.1.3(d) |
| Business Continuity & DR | A.5.29, A.5.30 |
| Evidence Management | Clause 7.5 |
| Audit Trail | A.8.15, Clause 9.1 |
| Reports | Clause 9.1 |
| Data Classification | A.5.12, A.5.13, A.5.14 |
| Users & Access | A.5.16–A.5.18, A.8.2 |
| Settings | Platform Configuration |

---

*This document is the internal reference for the SentraISMS platform. It describes the purpose and use of every page in relation to ISO 27001:2022 requirements. Keep it updated as the platform evolves.*
