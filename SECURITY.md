# Security Policy

## Supported Versions

The CampusHub engineering and student development team actively maintains and releases security patches for the following versions:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| `main`  | :white_check_mark: | Active (Winter 2026 Semester) |
| `< 1.0` | :x:                | Unsupported |

---

## Reporting a Vulnerability

The CampusHub project takes the security of campus data, student authentication, and academic privacy very seriously. 

If you discover a security vulnerability, defect, or credential exposure, **please do not report it through a public GitHub issue**. Publicly disclosing vulnerabilities puts student accounts and cohort data at risk.

Instead, please report vulnerabilities directly to the student development leads through one of the following private channels:

### 1. Private Email Disclosure (Recommended)
Send details of the vulnerability to both student development leads:
- **Udeep Chowdary**: [`udeep.chowdary.s83@kalvium.community`](mailto:udeep.chowdary.s83@kalvium.community)
- **Mageshwaran T**: [`mageshwaran.t.s83@kalvium.community`](mailto:mageshwaran.t.s83@kalvium.community)

### 2. GitHub Private Vulnerability Reporting
If you have access, navigate to the **[Security Advisories](https://github.com/UdeepChowdary/CampusHub/security/advisories)** tab and click **"Report a vulnerability"** to open a private advisory draft.

---

## What to Include in Your Report

To help us triage and patch the issue quickly, please provide:
1. **Description**: A clear summary of the issue and its potential security impact.
2. **Steps to Reproduce**: Detailed reproduction steps, sample payload, or proof-of-concept (PoC).
3. **Affected Component**: URL endpoint, API route, or component file (e.g., `/api/auth`, `/api/contact`, role validation, or Firestore rules).
4. **Environment**: Browser, device, and operating system used during discovery.
5. **Mitigation Suggestion**: Any proposed fix or remediation (if known).

---

## Response & Disclosure Process

- **Initial Triage**: We will acknowledge receipt of your vulnerability report within **24 hours**.
- **Investigation & Patching**: The team will verify the vulnerability, evaluate severity, and prepare a fix on a secure patch branch.
- **Resolution**: Once a security patch is deployed to the production campus instance, we will notify you and provide credit in our release notes (if desired).
- **Responsible Disclosure**: We kindly ask security researchers and students to allow us a reasonable time frame (up to 7 days) to remediate the vulnerability before discussing it publicly.

---

## Core Security Commitments & Architecture

- **Zero API Key Storage**: User-provided Google Gemini API keys are never stored on Firestore, databases, or cookies; they exist strictly in client-side local memory for event poster extraction.
- **Strict Domain Restrictions**: CampusHub account creation and role access are restricted to institutional emails ending with `@kalvium.community` or `@kalvium.com`.
- **HMAC Role Integrity**: Administrative and Campus Manager role transitions are cryptographically signed using server-side HMAC secrets to prevent client-side privilege escalation.
- **Audit Trails**: Critical event approvals, rejections, and schedule modifications are logged in Firestore audit streams with actor timestamps.
