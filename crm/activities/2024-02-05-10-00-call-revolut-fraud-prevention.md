---
type: call
subject: Fraud Prevention Analytics Requirements
date: "2024-02-05 10:00"
duration: 35
status: completed
contacts:
  - "[[contacts/johansson-erik]]"
company: "[[companies/revolut]]"
owner: Lisa Wang
outcome: Requirements gathered for fraud monitoring
next_action: Provide technical proposal by February 12
tags: ["fraud-prevention", "fintech", "real-time"]
created_at: "2024-02-05"
---

# Revolut Fraud Prevention Call

Solid call with [[contacts/johansson-erik|Erik]] from Revolut's risk management team about their fraud prevention monitoring needs. They're experiencing sophisticated attack patterns that their current monitoring isn't catching quickly enough.

Current pain: They're seeing new types of fraud attacks where bad actors test small amounts across thousands of accounts before executing larger transactions. By the time their current systems detect the pattern, significant damage is done. Erik mentioned one recent attack cost them €200K before detection.

Technical requirements discussed:
- Real-time transaction pattern analysis across all user accounts
- Anomaly detection for unusual spending patterns within minutes 
- Geographic correlation of suspicious activity
- Integration with their existing fraud scoring models
- Compliance reporting for regulatory requirements (FCA, ECB)

Erik was particularly interested in our machine learning capabilities for detecting previously unknown fraud patterns. They want to move beyond rule-based detection to more sophisticated behavioral analytics.

Competitive landscape: They're currently using a mix of internal tools and are evaluating DataRobot for ML-based fraud detection. Our advantage is real-time processing and integration with their existing infrastructure.

Budget conversation: Erik confirmed they have significant budget allocated for fraud prevention improvements in 2024. Timeline is aggressive - they want solution in place by April due to regulatory pressure.

Challenge areas:
- They need UK/EU data residency compliance 
- Require sub-second query response times for real-time fraud scoring
- Integration complexity with their microservices architecture

Next steps:
- Send technical proposal addressing data residency requirements
- Provide references from other European fintech customers
- Schedule technical deep-dive with their engineering team