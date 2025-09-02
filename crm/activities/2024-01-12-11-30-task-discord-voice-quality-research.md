---
type: task
subject: Research Discord Voice Quality Monitoring Requirements
date: "2024-01-12 11:30"
status: completed
contacts:
  - "[[contacts/anderson-kyle]]"
company: "[[companies/discord]]"
deal: "[[deals/discord-2024-q2-voice-quality]]"
owner: Sarah Chen
outcome: Requirements documented, technical challenges identified
next_action: Schedule technical deep-dive meeting
tags: ["research", "voice-quality", "gaming", "real-time"]
created_at: "2024-01-12"
---

# Discord Voice Quality Research

Completed research into Discord's voice quality monitoring needs based on preliminary discussions with [[contacts/anderson-kyle|Kyle]] from their infrastructure team.

Discord's unique challenges:
- 150M+ monthly active users in voice channels
- Gaming communities have very low tolerance for voice lag or quality issues
- Massive scale with peaks during gaming events and weekends
- Global infrastructure with complex routing for low-latency voice

Key requirements identified:
1. Real-time monitoring of voice packet loss across regions
2. Latency tracking for voice streams between users
3. Quality scoring based on jitter, packet loss, and bitrate
4. Geographic performance analysis for server placement decisions
5. Alerting when voice quality degrades during peak usage

Technical architecture needs:
- Processing millions of concurrent voice streams
- Sub-second detection of quality degradation
- Integration with their existing infrastructure monitoring
- Custom metrics for gaming-specific voice quality measures

Research findings from similar customers:
- [[companies/twilio|Twilio]] has similar voice infrastructure but different use case (business communications vs gaming)
- Gaming voice requirements are more stringent than business voice
- Need specialized metrics like "competitive gaming voice quality" scores

Competitive landscape:
- Discord likely has custom internal monitoring already
- Opportunity is in providing deeper insights and predictive analytics
- Other gaming companies ([[companies/riot-games|Riot Games]], [[companies/roblox|Roblox]]) have similar challenges

Budget and decision-making:
- Infrastructure decisions at Discord involve multiple teams
- Gaming performance is critical to user retention
- They have significant technical resources but prefer vendor solutions for non-core functionality

Next steps:
- Schedule technical deep-dive with Kyle's team
- Prepare demo showing gaming-specific voice quality metrics
- Research more gaming voice quality benchmarks and standards