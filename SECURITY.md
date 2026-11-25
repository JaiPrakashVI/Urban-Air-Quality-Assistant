# Security Policy & Guardrail Architecture

## Overview
AeroShield is designed following the **Safe & Responsible AI Implementation** guidelines outlined in the PromptWars evaluation criteria. The application incorporates multi-layered defense mechanisms against client-side exploitation, data leakage, and adversarial prompt injection.

---

## Security Guardrails Implemented

### 1. Zero Secret Leakage (Credential Protection)
- **Public Repository Cleanliness:** Zero API keys, production tokens, or environment credentials are committed to version control.
- **Environment Abstraction:** All runtime configuration is managed through `.env.example`.
- **Offline Autonomous Fallback:** The application functions fully without requiring an active paid API key, preventing rate-limiting or accidental token leakage during evaluation.

### 2. Client-Side Input Sanitization (XSS Mitigation)
- **Entity Escaping:** All user-supplied inputs pass through `sanitizeInput()` in `src/services/securitySanitizer.ts`, replacing dangerous HTML characters (`<`, `>`, `&`, `"`, `'`) with safe HTML entities before state injection.
- **Length Boundary Enforcement:** User queries are capped at a strict 500-character ceiling to prevent buffer attacks or UI layout breaking.

### 3. Prompt Injection Defense
- **Adversarial Pattern Interception:** The security layer monitors incoming prompts for known jailbreak vectors, including:
  - `ignore previous instructions`
  - `system prompt dump`
  - `you are now a rogue bot`
  - `bypass safety/filter`
- **Context Isolation:** System context boundaries separate prompt instructions from user queries when dispatching to generative models, preventing instruction hijacking.

### 4. Safe Health Advisory Boundaries
- **Clinical Disclaimer:** The assistant provides lifestyle, environmental, and preventive health recommendations based on CPCB and WHO guidelines, while prompting immediate emergency medical care for acute respiratory distress.
- **No Hallucinated Telemetry:** Live atmospheric data is strictly fetched from validated APIs (Open-Meteo Atmospheric) rather than hallucinated by LLMs.

---

## Reporting a Vulnerability
To report potential security vulnerabilities or prompt leakage issues, please contact the maintainers at:
`jaiprakashviofficial@gmail.com`
