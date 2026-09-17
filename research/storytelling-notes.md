# Storytelling research notes (for the course)

Gathered 2026-09-17. Language: English. Target AI: MiniCPM5-1B/2B in the browser, so each
exercise must be SHORT (a paragraph to ~300 words) and checkable by the learner.

## 1. How existing courses teach it

| Course | Structure | Free? |
|---|---|---|
| Wesleyan, *Craft of Plot* (Coursera) | W1 what plot is (character + action = plot) → W2 structure, Freytag's pyramid, 5 acts → W3 scenes, showing vs telling → W4 revising | Audit free |
| Pixar in a Box: *Art of Storytelling* (Khan Academy) | "We are all storytellers" → character → story structure → visual language/storyboards → pitching. Videos + hands-on activities, idea → storyboard | Free |
| Brandon Sanderson BYU lectures (2025, YouTube) | Plot (promise/progress/payoff) → structure → character → setting/worldbuilding | Free |

Common order in all of them: **idea → character → structure → scene → prose/dialogue → revision.**

## 2. Core frameworks (the course content)

### Minimal story model
- **Character + want + obstacle = story.** No obstacle means no story.
- **Major dramatic question:** the one question the reader wants answered ("Will she escape?"). Should be clear by the end of Act 1.

### Story Spine (Kenn Adams, ~1991; popularized by Pixar)
Once upon a time… / Every day… / But one day… / Because of that… / Because of that… /
Because of that… / Until finally… / And ever since then…
→ Best first exercise: 8 sentences = a complete story. Perfect size for a 1B model.

### Promise → Progress → Payoff (Sanderson)
- Beginning makes **promises** (genre, tone, the kind of problem).
- Middle shows **progress** toward those promises; lack of progress = reader quits.
- Ending **pays off** the promises made. Setbacks must relate to the promises.

### Escalation: try-fail cycles
- Character tries, fails, and each failure makes things harder.
- **"Yes, but / No, and":** success brings a complication; failure makes it worse.

### Big structures (compare, don't worship: "be a chef, not a cook")
| Model | Shape | Good for |
|---|---|---|
| Three-act | Setup / confrontation / resolution | General default; weak spot = huge Act 2 |
| Freytag's pyramid | Exposition → rising action → climax → falling action → resolution | Teaching tension curve |
| Hero's Journey (Campbell) | Departure / Initiation / Return (17 stages) | Quests, transformation |
| Dan Harmon's Story Circle | You, Need, Go, Search, Find, Take, Return, Change | Short/episodic stories; simplified Hero's Journey |
| Kishōtenketsu (East Asian) | Intro, development, twist, conclusion. Conflict not required | Quiet, observational stories |

### Character
- **Want vs need:** what they chase (external) vs what they must learn (internal). The arc = moving from want toward need.
- **Flaw** blocks the need; the climax forces a choice.
- Sanderson's sliders: **proactivity, competence, sympathy.** Raise one to make a character engaging.

### Scene level (Dwight Swain)
- **Scene = Goal → Conflict → Disaster** (disaster = "no", "yes, but", or "no, and furthermore").
- **Sequel = Reaction → Dilemma → Decision.** Links scenes and gives the next goal.

### Story types (Orson Scott Card's MICE quotient)
Milieu (enter/leave a place), Idea (a question answered), Character (an inner change), Event (order disrupted/restored).
Open and close threads in nested order.

### Prose craft
- Show vs tell; sensory detail; point of view (1st / 3rd limited / omniscient); dialogue that carries subtext; revision.
- "Hang a lantern": acknowledge an oddity in-story instead of hiding it.

## 3. Proposed course outline (8 lessons + AI exercise each)

| # | Lesson | Learner exercise | What the AI does (short output) |
|---|---|---|---|
| 1 | What is a story? (character + want + obstacle, dramatic question) | Write a 1-line premise | Suggests 3 obstacles for your premise |
| 2 | Story Spine | Fill the 8 sentences | Writes a spine from your premise; you compare |
| 3 | Character: want, need, flaw | Make a character card | Interviews your character (answers in voice) |
| 4 | Promise → Progress → Payoff | List your opening promises | Checks if your ending pays them off |
| 5 | Structure: 3-act, Story Circle, Kishōtenketsu | Map one idea to 2 structures | Outlines your idea in the chosen structure |
| 6 | Scenes: goal–conflict–disaster, try-fail | Plan one scene | Drafts the scene (~250 words) from your plan |
| 7 | Show don't tell, POV, dialogue | Rewrite a "telling" paragraph | Rewrites text as showing / changes POV |
| 8 | Revision & final story | Write a 500–1000 word story | Gives feedback against the lesson checklists |

Design rules for the 1B model: one small task per call, give it the learner's own notes,
ask for a fixed format (lists, ≤250 words), and make the learner judge the output.
The learning should come from comparing and critiquing, not from the AI writing the story for them.

## Sources
- https://www.coursera.org/learn/craft-of-plot
- https://www.khanacademy.org/computing/pixar/storytelling
- https://www.openculture.com/2017/02/pixar-khan-academy-offer-a-free-online-course-on-storytelling.html
- https://www.brandonsanderson.com/blogs/blog/brandon-sandersons-2025-guide-to-plot-lecture-2
- https://www.brandonsanderson.com/blogs/blog/brandon-sandersons-2025-overview-of-story-structure-lecture-3
- https://www.npr.org/2026/06/23/nx-s1-5750619/meet-the-creator-of-the-story-spine-an-8-sentence-tool-to-create-and-analyze-stories
- https://www.aerogrammestudio.com/2013/03/22/the-story-spine-pixars-4th-rule-of-storytelling/
- https://reedsy.com/blog/guide/story-structure/dan-harmon-story-circle/
- https://scyn.app/blog/story-structure-templates
- https://www.septembercfawkes.com/2021/09/scene-structure-according-to-dwight-v.html
- https://en.wikipedia.org/wiki/Scene_and_sequel
- https://www.natelistrom.com/2024/03/05/beginning-middle-end-3.html
