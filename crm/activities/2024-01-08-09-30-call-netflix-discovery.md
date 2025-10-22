---
type: call
subject: Discovery Call - Streaming Infrastructure Monitoring
date: "2024-01-08 09:30"
duration: 45
status: completed
contacts:
  - "[[contacts/anderson-chris]]"
  - "[[contacts/chen-lisa]]"
company: "[[companies/netflix]]"
opportunity: "[[opportunities/netflix-2024-q2-streaming-monitoring]]"
owner: Sarah Chen
outcome: Clear pain points identified
next_action: Schedule technical architecture deep-dive
tags: ["discovery", "streaming", "infrastructure"]
created_at: "2024-01-08"
---

# Netflix Discovery Call - Streaming Infrastructure

Great initial call with [[contacts/anderson-chris|Chris]] and [[contacts/chen-lisa|Lisa]] from Netflix's infrastructure team. Chris owns the overall monitoring strategy while Lisa focuses on real-time streaming performance.

Their main challenge is visibility into their global CDN performance during peak viewing hours. They're seeing intermittent buffering issues in certain regions but current monitoring doesn't give them the granular data needed to identify root causes quickly. Lisa mentioned they're losing millions in subscriber satisfaction when these issues cascade.

Key pain points discussed:
- Current monitoring has 5-minute delays which is too slow for streaming
- Need sub-second visibility into CDN edge performance 
- Want to correlate network metrics with actual video quality scores
- Compliance requirements for different regions make reporting complex

Chris was particularly interested in our real-time alerting capabilities and asked about integration with their existing Kafka infrastructure. Lisa wants to understand how we handle high-cardinality time series data at Netflix's scale.

They're evaluating multiple vendors including building internally. Budget approval process typically takes 8-12 weeks but Chris said this is a priority initiative for 2024.

Next steps:
- Send technical architecture overview
- Schedule deep-dive with their streaming engineering team
- Provide reference customer examples from other video platforms