---
id: wayfinder
name: wayfinder-sidebar
where: Open source
period: 2026-11
methods: [Agent tooling]
tools: [TypeScript]
source: ../wayfinder-sidebar (read-only); https://github.com/nicksmits1/wayfinder-sidebar
links: [GitHub -> https://github.com/nicksmits1/wayfinder-sidebar, Reddit post -> https://www.reddit.com/r/claudeskills/comments/1xs1lt0/a_sidebar_for_matt_pococks_wayfinder/]
credit: a sidebar for Matt Pocock's /wayfinder skill (https://github.com/mattpocock/skills)
disclosure: public
---
A Claude Code plugin. Your ticket map sits beside the chat, and one click starts a new agent session with a handoff.

## Facts
- 14k views and 36 upvotes on r/claudeskills (as of 2026-11-17, from Nicolas).
- 10 GitHub stars (as of 2026-11-17).

## Sections
### Motivation
I plan bigger features with Matt Pocock's `/wayfinder` skill, which breaks the work into a map of tickets that are each small enough for one fresh Claude Code session. Once a dozen tickets were open, I kept losing track of which were ready, which another tab had already claimed, and how full each session's context was. So I built a sidebar that keeps the map next to the chat.

### Features
Tickets sit in Ready, Claimed and Blocked groups, coloured by type. Pressing ▶ opens a new terminal tab running `/wayfinder` on that ticket, and the current session can write it a handoff note first. Every tab sees claims and resolutions from the others within seconds, and a bar per session shows its context against the 200k budget. It only reads the tracker and never edits a ticket.

## Visual
Voice: first person, as a side project (Nicolas, 2026-11-17: "similar to my reddit post"). The Reddit post could not be fetched; match its wording once Nicolas pastes it.
Order on the page: demo video; "Motivation"; sidebar still; "Features".
Lead: `content/assets/wayfinder/demo.mp4` (pressing play on a ticket opens a new tab working it). Still: `sidebar.png`. Icon: `icon.svg`.
