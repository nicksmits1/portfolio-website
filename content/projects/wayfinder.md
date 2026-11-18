---
id: wayfinder
name: 'wayfinder-sidebar'
where: 'Open source'
period: '2026-11'
methods: [Agent tooling]
tools: [TypeScript]
source: '../wayfinder-sidebar (read-only); https://github.com/nicksmits1/wayfinder-sidebar'
credit: 'a sidebar for Matt Pocock''s /wayfinder skill (https://github.com/mattpocock/skills)'
disclosure: 'public'
short: wayfinder-sidebar
when: Nov 2026
year: 2026
links:
  - { label: GitHub, href: "https://github.com/nicksmits1/wayfinder-sidebar", icon: gh }
  - { label: "Reddit post", href: "https://www.reddit.com/r/claudeskills/comments/1xs1lt0/a_sidebar_for_matt_pococks_wayfinder/", icon: paper }
rail:
  - ["15k", "views on r/claudeskills"]
  - ["36", "upvotes"]
  - ["10", "GitHub stars"]
figures:
  demo: { kind: video, src: demo.mp4, poster: sidebar.png, alt: "Pressing play on a ticket in the sidebar opens a new Claude Code tab working that ticket", fine: "Pressing ▶ on a ticket opens a new tab that works it." }
  still: { kind: img, plate: shot, src: sidebar.png, alt: "The sidebar beside the chat, with the start confirmation open under a ready ticket", caption: "The map beside the chat: Ready, Claimed and Blocked, with a context bar per session.", source: "Screenshot from the repo." }
order: [demo, Motivation, still, Features]
---
A Claude Code plugin. Your ticket map sits beside the chat, and one click starts a new agent session with a handoff.

## Facts
- 15k views and 36 upvotes on r/claudeskills (as of 2026-11-17, from Nicolas).
- 10 GitHub stars (as of 2026-11-17).

## Sections
### Motivation
I've been living in Matt Pocock's skills, especially `/wayfinder`, which is great at breaking a big project into tickets. Then I noticed most of my "work" was finding the next ready ticket, copying a prompt, opening a new tab and pasting it into a fresh session, once for every agent I wanted running in parallel. So I did what any reasonable person does: I spent more time automating it than it would ever take to just do it.

### Features
The sidebar puts the wayfinder map in a pane next to the chat: Ready, Claimed and Blocked at a glance, coloured by ticket type. Press ▶ and a new tab opens with a Claude session already working on the ticket, with a handoff note from the current session if you want one, or pick several and launch them at once. A context bar per session fills against a 200k budget and turns yellow, then red, a polite hint to start fresh. Tabs stay in sync, and a ticket flashes when it unblocks.

## Visual
Voice: first person, as a side project, after Nicolas's Reddit post (text supplied 2026-11-17): dry, self-deprecating, short.
Order on the page: demo video; "Motivation"; sidebar still; "Features".
Lead: `content/assets/wayfinder/demo.mp4` (pressing play on a ticket opens a new tab working it). Still: `sidebar.png`. Icon: `icon.svg`.
