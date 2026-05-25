# Execution Roadmap

# Phase 1 — Monorepo Infrastructure Hardening

## Goal

Standardize and harden the existing shadcn monorepo foundation for InvoiceGuard architecture requirements.

The monorepo is already initialized using:

- shadcn/ui monorepo structure
- Turborepo
- npm workspaces

This phase focuses on:

- configuration hardening
- workspace standardization
- shared infrastructure setup
- architectural alignment

---

## Units

1. `packages — setup — monorepo configuration hardening`
2. `packages — setup — shared tsconfig standardization`
3. `packages — setup — shared eslint standardization`
4. `packages — setup — shared prettier configuration`
5. `packages — types — base shared contracts setup`
6. `packages — validation — zod validation infrastructure`
7. `packages — logger — pino logger infrastructure`
8. `packages — utils — common utilities setup`
9. `packages — db — drizzle setup + postgres connection`
10. `packages — queues — BullMQ queue infrastructure`
11. `packages — integrations — integration package foundation`
12. `api — setup — express bootstrap`
13. `api — setup — async wrapper + global error middleware`
14. `api — setup — security middleware`
15. `api — setup — environment validation`
16. `worker — setup — BullMQ worker bootstrap`
17. `web — setup — design token alignment + global theme system`

---

# Phase 2 — Authentication & Organizations

## Goal

Build production-grade authentication and organization infrastructure before product systems.

---

# Database Units

17. `api — auth — user schema + drizzle model`
18. `api — auth — organization schema + drizzle model`
19. `api — auth — organization membership schema`
20. `api — auth — session schema`

---

# Validation Units

21. `api — auth — registration validation`
22. `api — auth — login validation`
23. `api — auth — organization validation`

---

# Middleware Units

24. `api — auth — Clerk middleware integration`
25. `api — auth — authenticated user middleware`
26. `api — auth — organization authorization middleware`

---

# Repository Units

27. `api — auth — user repository`
28. `api — auth — organization repository`

---

# Service Units

29. `api — auth — registration service`
30. `api — auth — organization creation service`
31. `api — auth — session validation service`

---

# Controller & Route Units

32. `api — auth — auth controllers + routes`
33. `api — organizations — organization controllers + routes`

---

# Testing Units

34. `api — auth — auth module tests`

---

# Phase 3 — Company Search Foundation (Phase A Priority)

## Goal

Build company search infrastructure and normalized intelligence aggregation layer.

---

# Database Units

35. `api — companies — company schema`
36. `api — companies — intelligence snapshot schema`
37. `api — companies — search cache schema`

---

# Validation Units

38. `api — companies — company search validation`
39. `api — companies — intelligence query validation`

---

# Integration Units

40. `packages — integrations — Companies House adapter`
41. `packages — integrations — Registry Trust adapter`
42. `packages — integrations — Insolvency Service adapter`
43. `packages — integrations — London Gazette adapter`
44. `packages — integrations — Fair Payment Code adapter`

---

# Repository Units

45. `api — companies — company repository`
46. `api — companies — intelligence repository`
47. `api — companies — cache repository`

---

# Queue Units

48. `packages — queues — company search queue`
49. `packages — queues — intelligence refresh queue`

---

# Service Units

50. `api — companies — company resolution service`
51. `api — companies — intelligence aggregation service`
52. `api — companies — cache orchestration service`
53. `api — companies — search service`

---

# Worker Units

54. `worker — companies — intelligence refresh worker`
55. `worker — companies — cache warming worker`

---

# Controller & Route Units

56. `api — companies — search controllers + routes`

---

# Testing Units

57. `api — companies — company search tests`

---

# Phase 4 — Report & Monetization System (Phase A)

## Goal

Build intelligence report generation, paywall infrastructure, Stripe integration, and PDF delivery.

---

# Database Units

58. `api — reports — report schema`
59. `api — reports — report entitlement schema`
60. `api — reports — purchase schema`
61. `api — reports — report generation job schema`

---

# Validation Units

62. `api — reports — report purchase validation`
63. `api — payments — Stripe checkout validation`

---

# Queue Units

64. `packages — queues — report generation queue`
65. `packages — queues — PDF render queue`
66. `packages — queues — email delivery queue`
67. `packages — queues — Stripe webhook queue`

---

# Integration Units

68. `packages — integrations — Stripe adapter`
69. `packages — integrations — Postmark adapter`

---

# Repository Units

70. `api — reports — report repository`
71. `api — payments — purchase repository`
72. `api — reports — entitlement repository`

---

# Service Units

73. `api — reports — teaser report service`
74. `api — reports — report entitlement service`
75. `api — payments — Stripe checkout service`
76. `api — reports — report generation orchestration service`
77. `api — notifications — report email delivery service`

---

# Worker Units

78. `worker — reports — report generation worker`
79. `worker — reports — PDF rendering worker`
80. `worker — notifications — email delivery worker`
81. `worker — webhooks — Stripe webhook processor`

---

# Webhook Units

82. `api — webhooks — Stripe webhook endpoint`
83. `api — webhooks — email delivery webhook endpoint`

---

# Controller & Route Units

84. `api — reports — report controllers + routes`
85. `api — payments — payment controllers + routes`
86. `api — webhooks — webhook controllers + routes`

---

# Testing Units

87. `api — reports — report system tests`
88. `api — payments — Stripe integration tests`
89. `api — webhooks — webhook tests`

---

# Phase 5 — Public Web Application (Phase A)

## Goal

Build the customer-facing search and intelligence experience.

---

# Units

90. `web — setup — application shell`
91. `web — marketing — landing page`
92. `web — search — search experience UI`
93. `web — reports — teaser report UI`
94. `web — reports — locked panel system`
95. `web — payments — Stripe checkout integration`
96. `web — dashboard — authenticated dashboard shell`
97. `web — dashboard — report purchase history`
98. `web — dashboard — saved company history`
99. `web — auth — Clerk frontend integration`
100.  `web — frontend — frontend integration tests`

---

# Phase 6 — Invoice Infrastructure Foundation (Phase B)

## Goal

Establish invoice domain architecture and unified invoice schema.

---

# Database Units

101. `api — invoices — invoice schema`
102. `api — invoices — invoice upload schema`
103. `api — invoices — payment event schema`

---

# Validation Units

104. `api — invoices — invoice upload validation`
105. `api — invoices — invoice normalization validation`

---

# Repository Units

106. `api — invoices — invoice repository`
107. `api — invoices — payment event repository`

---

# Queue Units

108. `packages — queues — invoice ingestion queue`
109. `packages — queues — OCR processing queue`

---

# Service Units

110. `api — invoices — invoice ingestion orchestration service`
111. `api — invoices — invoice normalization service`

---

# Worker Units

112. `worker — invoices — invoice ingestion worker`
113. `worker — invoices — OCR processing worker`

---

# Testing Units

114. `api — invoices — invoice infrastructure tests`

---

# Phase 7 — Accounting Integrations (Phase B)

## Goal

Build accounting synchronization infrastructure.

---

# Integration Units

115. `packages — integrations — Xero adapter`
116. `packages — integrations — QuickBooks adapter`

---

# Validation Units

117. `api — integrations — OAuth validation`

---

# Repository Units

118. `api — integrations — OAuth connection repository`

---

# Queue Units

119. `packages — queues — invoice sync queue`

---

# Service Units

120. `api — integrations — Xero sync service`
121. `api — integrations — QuickBooks sync service`
122. `api — integrations — OAuth lifecycle service`

---

# Worker Units

123. `worker — integrations — invoice sync worker`

---

# Webhook Units

124. `api — webhooks — Xero webhook endpoint`
125. `api — webhooks — QuickBooks webhook endpoint`

---

# Testing Units

126. `api — integrations — accounting integration tests`

---

# Phase 8 — Interest & Enforcement Engine (Phase B)

## Goal

Build overdue detection, statutory interest calculation, and workflow state management.

---

# Database Units

127. `api — enforcement — overdue workflow schema`
128. `api — enforcement — dispute schema`

---

# Validation Units

129. `api — enforcement — interest calculation validation`

---

# Queue Units

130. `packages — queues — interest calculation queue`
131. `packages — queues — notification queue`

---

# Service Units

132. `api — enforcement — overdue detection service`
133. `api — enforcement — statutory interest service`
134. `api — enforcement — dispute workflow service`

---

# Worker Units

135. `worker — enforcement — interest calculation worker`
136. `worker — enforcement — overdue monitoring worker`

---

# Testing Units

137. `api — enforcement — enforcement engine tests`

---

# Phase 9 — Demand Letter System (Phase B)

## Goal

Build automated demand letter generation and delivery workflows.

---

# Database Units

138. `api — letters — demand letter schema`
139. `api — letters — delivery log schema`

---

# Validation Units

140. `api — letters — demand letter validation`

---

# Queue Units

141. `packages — queues — demand letter queue`

---

# Service Units

142. `api — letters — template rendering service`
143. `api — letters — demand letter orchestration service`

---

# Worker Units

144. `worker — letters — PDF demand letter worker`
145. `worker — notifications — demand letter email worker`

---

# Controller & Route Units

146. `api — letters — demand letter controllers + routes`

---

# Testing Units

147. `api — letters — demand letter tests`

---

# Phase 10 — Company Response Portal (Phase B)

## Goal

Allow external companies to respond to enforcement workflows securely.

---

# Database Units

148. `api — portal — response token schema`
149. `api — portal — company response schema`

---

# Validation Units

150. `api — portal — company response validation`

---

# Service Units

151. `api — portal — response token service`
152. `api — portal — payment confirmation service`
153. `api — portal — dispute submission service`

---

# Controller & Route Units

154. `api — portal — portal controllers + routes`

---

# Testing Units

155. `api — portal — response portal tests`

---

# Phase 11 — Admin & Operations Dashboard

## Goal

Build internal operational tooling.

---

# Units

156. `admin — auth — protected admin layout`
157. `admin — dashboard — operational dashboard shell`
158. `admin — reports — report monitoring UI`
159. `admin — webhooks — webhook monitoring UI`
160. `admin — queues — queue monitoring UI`
161. `admin — integrations — integration health UI`
162. `admin — dashboard — frontend tests`

---

# Phase 12 — System Hardening & Production Readiness

## Goal

Ensure production-grade reliability, consistency, observability, and deployment readiness.

---

# Units

163. `api — observability — structured logging verification`
164. `api — observability — Sentry integration verification`
165. `api — security — auth & access audit`
166. `api — queues — retry & idempotency audit`
167. `web — audit — UI consistency verification`
168. `full-system — test — end-to-end workflow testing`
169. `deployment — setup — production infrastructure configuration`

---

# Deferred Systems

The following systems are intentionally excluded from MVP implementation:

- AI-generated legal letters
- ML risk scoring
- predictive payment analytics
- realtime collaboration
- mobile applications
- multi-region infrastructure
- advanced analytics engine
- recommendation systems
- open banking integrations
- Sage integration
- FreeAgent integration

Do NOT implement deferred systems unless explicitly added to roadmap scope.

---

# Final Definition

A strictly ordered, layered, event-driven implementation roadmap designed for AI-assisted development of a production-grade financial intelligence and invoice enforcement platform, ensuring deterministic workflows, queue-safe infrastructure evolution, architectural consistency, scalable domain boundaries, and disciplined phased delivery across the InvoiceGuard monorepo.
