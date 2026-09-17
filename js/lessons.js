// Course content. `body` is trusted HTML written by the course author.
// Each exercise: learner fills `fields`, then `ai.prompt(values)` builds the request for the small model.

// Prompts are written for 1–2B models: short instructions, the exact labels to use, and a `prefill`
// that starts the answer with the first label. Tested in the browser with MiniCPM5-1B and -2B:
// - describing formatting in words ("in bold", "a colon") gets copied literally,
// - a blank template at the end of the prompt gets echoed back (2B),
// - one-shot examples get copied (1B).
const SYSTEM_COACH =
  'You are a helpful writing coach for beginner storytellers. Be specific and concise. No preamble.';

const SHAPE_STEPS = {
  'Three acts': ['Act 1 (Setup)', 'Act 2 (Confrontation)', 'Act 3 (Resolution)'],
  "Freytag's pyramid": ['Exposition', 'Rising action', 'Climax', 'Falling action', 'Resolution'],
  'Story Circle': ['You', 'Need', 'Go', 'Search', 'Find', 'Take', 'Return', 'Change'],
  'Kishōtenketsu': ['Introduction', 'Development', 'Twist', 'Conclusion'],
};

const DISASTERS = {
  'No': 'the character fails to get what they want',
  'Yes, but': 'the character gets what they want, but it costs them something painful',
  'No, and': 'the character fails, and the situation becomes even worse',
};

const REWRITES = {
  'Showing, with senses':
    'Rewrite it in third person. Do not name any feelings. Instead show what the character does, sees, hears and touches, so the reader can guess the feelings.',
  'First person':
    'Rewrite it in first person ("I"), as the character speaking. Do not name any feelings; show them through small actions and thoughts.',
  'A short dialogue with subtext':
    'Rewrite it as a short conversation between the character and the person the text is about. They talk about something ordinary, like the weather, but the reader can feel the real emotions underneath. Nobody says how they feel.',
};

export const LESSONS = [
  {
    id: 1,
    title: 'What is a story?',
    minutes: 15,
    body: `
      <p>A list of events is not a story. <em>"I woke up, ate breakfast, went to work"</em> is a list.
      A story starts when someone <strong>wants</strong> something and something <strong>gets in the way</strong>.</p>
      <div class="formula">Character + Want + Obstacle = Story</div>
      <p><em>"A shy baker wants to win the town contest, but her oven breaks the night before."</em>
      Now you want to know what happens. That wish to know is the engine of every story.</p>
      <h3>The dramatic question</h3>
      <p>Every story quietly asks one big question: <em>Will she win the contest? Will they escape the flood?
      Will he tell his father the truth?</em> Readers keep reading to hear the answer. A good opening makes
      the question clear early; a good ending answers it.</p>
      <h3>Why obstacles matter</h3>
      <p>If the baker simply bakes and wins, nothing is at risk and nothing is learned. The obstacle forces
      choices, and choices show us who a character really is.</p>`,
    checklist: [
      'My character wants something specific.',
      'Something real stands in the way.',
      'I can say the dramatic question in one line.',
    ],
    exercise: {
      intro: 'Build a one-line premise. Then ask the AI for obstacles you have not thought of.',
      fields: [
        { id: 'character', label: 'Who is your character?', placeholder: 'a retired lighthouse keeper' },
        { id: 'want', label: 'What do they want?', placeholder: 'to see the northern lights once before moving away' },
        { id: 'obstacle', label: 'What stands in the way?', placeholder: 'a storm is coming and the lighthouse is closing forever' },
      ],
      ai: {
        button: 'Suggest 3 more obstacles',
        prompt: (v) => ({
          system: SYSTEM_COACH,
          user:
            `Character: ${v.character}\nWant: ${v.want}\nTheir current obstacle: ${v.obstacle}\n\n` +
            'Invent 3 NEW obstacles. Do not repeat or reword the current obstacle. Write 4 lines:\n' +
            'Line 1 starts "1. From the world:" and describes a problem caused by nature, places or events.\n' +
            'Line 2 starts "2. From another person:" and names a person who gets in the way.\n' +
            'Line 3 starts "3. From inside:" and describes a fear or flaw of the character.\n' +
            'Line 4 starts "Dramatic question:" and asks the question the story will answer.',
          prefill: '1. From the world:',
          maxTokens: 250,
        }),
      },
    },
  },
  {
    id: 2,
    title: 'The Story Spine',
    minutes: 20,
    body: `
      <p>The Story Spine is a tool made by playwright and improv teacher <strong>Kenn Adams</strong> around 1991,
      later made famous by story artists at Pixar. It is eight sentence starters. Fill them in and you have
      the skeleton of a complete story.</p>
      <ol class="spine">
        <li><strong>Once upon a time…</strong> <span>the world and the character</span></li>
        <li><strong>Every day…</strong> <span>their normal routine</span></li>
        <li><strong>But one day…</strong> <span>the event that breaks the routine</span></li>
        <li><strong>Because of that…</strong> <span>a consequence</span></li>
        <li><strong>Because of that…</strong> <span>a bigger consequence</span></li>
        <li><strong>Because of that…</strong> <span>the biggest one</span></li>
        <li><strong>Until finally…</strong> <span>the climax</span></li>
        <li><strong>And ever since then…</strong> <span>the new normal</span></li>
      </ol>
      <p>Notice the phrase <em>"because of that."</em> Each event is <strong>caused</strong> by the one before.
      Weak stories say <em>"and then… and then…"</em>. Strong stories say <em>"because of that… but then…"</em>.</p>`,
    checklist: [
      'Each "because of that" is caused by the previous line.',
      '"But one day" really breaks the "every day" routine.',
      '"Ever since then" shows something has changed.',
    ],
    exercise: {
      intro: 'Write your own spine first. Then let the AI write one from the same premise and compare. Which is stronger, and why?',
      fields: [
        { id: 'premise', label: 'Premise (one line)', placeholder: 'A retired lighthouse keeper wants to see the northern lights before the lighthouse closes.' },
        { id: 'spine', label: 'Your Story Spine (8 lines)', multiline: true, rows: 9,
          placeholder: 'Once upon a time…\nEvery day…\nBut one day…\nBecause of that…\nBecause of that…\nBecause of that…\nUntil finally…\nAnd ever since then…' },
      ],
      ai: {
        button: 'Write an AI spine to compare',
        prompt: (v) => ({
          system: SYSTEM_COACH,
          user:
            `Premise: ${v.premise}\n\n` +
            'Tell this story in exactly 8 lines, one sentence per line. The lines start with: "Once upon a time", "Every day", ' +
            '"But one day", "Because of that", "Because of that", "Because of that", "Until finally", "And ever since then". ' +
            'Each "Because of that" must be caused by the line before it.',
          prefill: 'Once upon a time,',
          maxTokens: 300,
        }),
      },
    },
  },
  {
    id: 3,
    title: 'Characters: want, need, flaw',
    minutes: 25,
    body: `
      <p>Interesting characters are pulled in two directions.</p>
      <ul>
        <li><strong>Want</strong>: the outside goal they chase. <em>Win the contest.</em></li>
        <li><strong>Need</strong>: the inside lesson they must learn. <em>Her worth does not depend on winning.</em></li>
        <li><strong>Flaw</strong>: the belief or habit that keeps them from the need. <em>She hides whenever people look at her.</em></li>
      </ul>
      <p>The <strong>character arc</strong> is the journey from want toward need. Often the climax forces a choice
      between them.</p>
      <h3>Three sliders</h3>
      <p>Writer Brandon Sanderson describes three qualities readers respond to. Picture each as a slider:</p>
      <ul>
        <li><strong>Proactivity</strong>: do they act, or only react?</li>
        <li><strong>Competence</strong>: are they good at something?</li>
        <li><strong>Sympathy</strong>: do we care about them?</li>
      </ul>
      <p>A character does not need all three at maximum. A character low on sympathy but very competent and
      proactive can still be gripping. A character low on everything is hard to follow. Raise one slider to fix it.</p>`,
    checklist: [
      'The want and the need are different.',
      'The flaw blocks the need.',
      'At least one slider (proactivity, competence, sympathy) is high.',
    ],
    exercise: {
      intro: 'Fill in a character card, then interview your character. Ask anything. If the answer surprises you, you have learned something.',
      fields: [
        { id: 'name', label: 'Name and one-line description', placeholder: 'Maren, 71, retired lighthouse keeper' },
        { id: 'want', label: 'Want', placeholder: 'to see the northern lights' },
        { id: 'need', label: 'Need', placeholder: 'to accept help from her estranged son' },
        { id: 'flaw', label: 'Flaw', placeholder: 'believes asking for help is weakness' },
        { id: 'question', label: 'Your interview question', placeholder: 'Why did you stop talking to your son?' },
      ],
      ai: {
        button: 'Ask my character',
        prompt: (v) => ({
          system:
            `You are ${v.name}, a character in a story, being interviewed. Speak as "I".\n` +
            `What you want: ${v.want}\nWhat you secretly need (you do not admit it): ${v.need}\nYour flaw: ${v.flaw}\n` +
            'Answer the question directly in 2 to 4 sentences. Let your flaw show in how you answer.',
          user: `Interviewer: ${v.question}\n${v.name.split(',')[0]}:`,
          maxTokens: 220,
        }),
      },
    },
  },
  {
    id: 4,
    title: 'Promise, progress, payoff',
    minutes: 20,
    body: `
      <p>Brandon Sanderson teaches plot as three parts that match beginning, middle and end:</p>
      <ul>
        <li><strong>Promise</strong>: the opening tells readers what kind of story this is (genre, tone, and the
        problem that matters). A ghost in chapter one promises a ghost story.</li>
        <li><strong>Progress</strong>: the middle must visibly move toward those promises. When readers feel no
        progress, they put the book down.</li>
        <li><strong>Payoff</strong>: the ending delivers what was promised, ideally in a way readers did not predict.</li>
      </ul>
      <h3>Try–fail cycles</h3>
      <p>Progress is not a straight line. The character tries, fails, and each failure makes the next try harder.
      Two small phrases help:</p>
      <div class="formula">"Yes, but…"  &nbsp;·&nbsp;  "No, and…"</div>
      <p><em>Yes, but</em>: she gets a new oven, but it only works at night. <em>No, and</em>: the neighbour refuses
      to lend his oven, and tells the whole town her cake is ruined. Both keep tension rising.</p>`,
    checklist: [
      'I can list the promises my opening makes.',
      'Every setback is connected to those promises.',
      'My ending pays off the biggest promise.',
    ],
    exercise: {
      intro: 'List the promises your opening makes and describe your ending. The AI checks if the ending pays them off.',
      fields: [
        { id: 'opening', label: 'Your opening (a few sentences or a summary)', multiline: true, rows: 4,
          placeholder: 'Maren finds a letter from her son inviting her north. She tears it up. That night the radio says the lighthouse will close in a week.' },
        { id: 'promises', label: 'Promises you think it makes', multiline: true, rows: 3,
          placeholder: '- a family conflict with her son\n- a race against time\n- a quiet, emotional tone' },
        { id: 'ending', label: 'Your ending (summary)', multiline: true, rows: 3,
          placeholder: 'She drives north alone and sees the lights from a parking lot.' },
      ],
      ai: {
        button: 'Check my payoffs',
        prompt: (v) => ({
          system: SYSTEM_COACH,
          user:
            `Here is a story plan.\n\nBeginning: ${v.opening}\n\nWhat the beginning promises the reader:\n${v.promises}\n\nEnding: ${v.ending}\n\n` +
            'Check whether the ending delivers what the beginning promised. Write 4 lines:\n' +
            'Line 1 starts "Delivered:" and names the promises the ending delivers.\n' +
            'Line 2 starts "Forgotten:" and names the promises the ending does not deliver.\n' +
            'Line 3 starts "Better ending idea:" with one sentence.\n' +
            'Line 4 starts "Setback for the middle:" with one moment where things get worse for the character.',
          prefill: 'Delivered:',
          maxTokens: 350,
        }),
      },
    },
  },
  {
    id: 5,
    title: 'Story shapes',
    minutes: 30,
    body: `
      <p>Structures are not rules. They are shelves to hang a story on so you can see what is missing.
      As Sanderson puts it, be a chef who understands recipes, not a cook who only follows them.</p>
      <table class="shapes">
        <tr><th>Shape</th><th>Steps</th><th>Good for</th></tr>
        <tr><td>Three acts</td><td>Setup · Confrontation · Resolution</td><td>Almost anything; watch for a saggy middle</td></tr>
        <tr><td>Freytag's pyramid</td><td>Exposition · Rising action · Climax · Falling action · Resolution</td><td>Seeing the tension curve</td></tr>
        <tr><td>Story Circle (Dan Harmon)</td><td>You · Need · Go · Search · Find · Take · Return · Change</td><td>Short and episodic stories</td></tr>
        <tr><td>Hero's Journey (Joseph Campbell)</td><td>Departure · Trials · Return, transformed</td><td>Quests and adventures</td></tr>
        <tr><td>Kishōtenketsu</td><td>Introduction · Development · Twist · Conclusion</td><td>Quiet stories without a villain</td></tr>
      </table>
      <p>Kishōtenketsu comes from East Asian poetry and storytelling. It does not need conflict: the <em>twist</em>
      is a new angle that changes how we see the first two parts. Try it when a "rising conflict" shape
      makes your gentle story feel forced.</p>`,
    checklist: [
      'I mapped my idea to at least two shapes.',
      'I know which shape exposed a missing part.',
    ],
    exercise: {
      intro: 'Pick a shape and let the AI outline your idea in it. Then try a second shape. What changed?',
      fields: [
        { id: 'idea', label: 'Story idea', multiline: true, rows: 3, placeholder: 'A retired lighthouse keeper wants to see the northern lights before the lighthouse closes.' },
        { id: 'shape', label: 'Shape', type: 'select',
          options: Object.keys(SHAPE_STEPS) },
      ],
      ai: {
        button: 'Outline in this shape',
        prompt: (v) => ({
          system: SYSTEM_COACH,
          user:
            `Story idea: ${v.idea}\n\n` +
            `Outline this story in ${SHAPE_STEPS[v.shape].length} steps. Write one line per step, starting with the step name, ` +
            `then one or two sentences about what happens. The steps are: ${SHAPE_STEPS[v.shape].join(', ')}.`,
          prefill: `${SHAPE_STEPS[v.shape][0]}:`,
          maxTokens: 400,
        }),
      },
    },
  },
  {
    id: 6,
    title: 'Building a scene',
    minutes: 30,
    body: `
      <p>Novels and films are made of scenes. Writing teacher <strong>Dwight V. Swain</strong> gave scenes a
      simple shape:</p>
      <div class="formula">Goal → Conflict → Disaster</div>
      <ul>
        <li><strong>Goal</strong>: what the viewpoint character wants <em>in this scene</em>. Small and clear.</li>
        <li><strong>Conflict</strong>: what pushes back.</li>
        <li><strong>Disaster</strong>: how it ends. <em>No</em> (they fail), <em>yes, but</em> (success with a
        cost), or <em>no, and</em> (fail and it gets worse).</li>
      </ul>
      <p>After a scene often comes a <strong>sequel</strong>, a quieter beat:</p>
      <div class="formula">Reaction → Dilemma → Decision</div>
      <p>The character feels the blow, weighs bad options, and chooses. That decision becomes the goal of the next scene.
      Scenes and sequels chain together into a plot.</p>`,
    checklist: [
      'The scene goal is clear in the first few lines.',
      'Something actively resists the goal.',
      'The scene ends with no / yes-but / no-and, not a neutral stop.',
    ],
    exercise: {
      intro: 'Plan a scene and let the AI draft it. Then edit the draft yourself. Editing is the real exercise.',
      fields: [
        { id: 'who', label: 'Viewpoint character', placeholder: 'Maren' },
        { id: 'setting', label: 'Setting', placeholder: 'a bus station at midnight, snow outside' },
        { id: 'goal', label: 'Scene goal', placeholder: 'buy the last ticket north' },
        { id: 'conflict', label: 'Conflict', placeholder: 'the clerk says the ticket is reserved for someone else' },
        { id: 'disaster', label: 'Disaster type', type: 'select', options: Object.keys(DISASTERS) },
      ],
      ai: {
        button: 'Draft this scene',
        prompt: (v) => ({
          system:
            'You are a skilled fiction writer. Write simple, vivid prose in third person, past tense. ' +
            'Show emotions through action and dialogue. Output only the story text.',
          user:
            `Write a scene of about 200 words.\nMain character: ${v.who}\nSetting: ${v.setting}\n` +
            `What the character tries to do: ${v.goal}\nWhat stops them: ${v.conflict}\n` +
            `How the scene ends: ${DISASTERS[v.disaster]}.`,
          maxTokens: 400,
        }),
      },
    },
  },
  {
    id: 7,
    title: 'Show, point of view, dialogue',
    minutes: 25,
    body: `
      <h3>Show, don't tell</h3>
      <p><em>Telling:</em> "Maren was nervous."<br>
      <em>Showing:</em> "Maren folded the ticket, unfolded it, and folded it again."</p>
      <p>Showing lets readers work out the feeling themselves, which makes them feel it more. Use the senses
      (sound, smell, touch, not only sight). Telling is still useful for skipping time quickly.</p>
      <h3>Point of view</h3>
      <ul>
        <li><strong>First person</strong> ("I"): close and personal, limited to one mind.</li>
        <li><strong>Third limited</strong> ("she", inside one head): the most common choice today.</li>
        <li><strong>Omniscient</strong>: the narrator knows everyone's thoughts. Powerful but easy to blur.</li>
      </ul>
      <h3>Dialogue with subtext</h3>
      <p>Real people rarely say exactly what they feel. <em>"Did you eat?"</em> from a mother can mean
      <em>"I miss you."</em> Let the words say one thing and the scene mean another.</p>`,
    checklist: [
      'I replaced at least one named emotion with an action.',
      'I used a sense other than sight.',
      'One line of dialogue means more than it says.',
    ],
    exercise: {
      intro: 'Paste a "telling" paragraph (or use the example) and pick a rewrite. Compare word by word with your original.',
      fields: [
        { id: 'text', label: 'Your paragraph', multiline: true, rows: 5,
          value: 'Maren was sad that her son had not called in years. She was also angry at him, and scared that it was too late to fix things. She felt very lonely in the lighthouse.' },
        { id: 'mode', label: 'Rewrite as', type: 'select',
          options: Object.keys(REWRITES) },
      ],
      ai: {
        button: 'Rewrite',
        prompt: (v) => ({
          system: 'You are a skilled fiction writer. Output only the new version of the text.',
          user: `Original text:\n"""\n${v.text}\n"""\n\n${REWRITES[v.mode]} Keep the same story facts. Do not copy any sentence from the original. Under 150 words.`,
          maxTokens: 300,
        }),
      },
    },
  },
  {
    id: 8,
    title: 'Revise and finish',
    minutes: 45,
    body: `
      <p>First drafts are for finding the story. Revision is for telling it well. Read your draft once for each
      question below. Don't try to fix everything in one pass.</p>
      <ol>
        <li>Is the <strong>dramatic question</strong> clear early?</li>
        <li>Does the character <strong>want</strong> something, and does an <strong>obstacle</strong> resist?</li>
        <li>Are the opening <strong>promises paid off</strong>?</li>
        <li>Do setbacks <strong>escalate</strong> ("because of that", not "and then")?</li>
        <li>Does at least one scene have a <strong>goal, conflict and disaster</strong>?</li>
        <li>Where could you <strong>show</strong> instead of tell?</li>
      </ol>
      <h3>What kind of story is it?</h3>
      <p>Orson Scott Card's <strong>MICE</strong> idea: a story is mainly about a <em>Milieu</em> (a place
      entered and left), an <em>Idea</em> (a question answered), a <em>Character</em> (an inner change), or an
      <em>Event</em> (order broken and restored). Your ending should close the kind of story you opened.</p>
      <p><strong>Final project:</strong> write a 500–1000 word story using everything from this course.</p>`,
    checklist: [
      'I did at least three separate revision passes.',
      'My ending closes the kind of story (MICE) I opened.',
      'I finished a complete story. Well done!',
    ],
    exercise: {
      intro: 'Paste your finished story. The AI finds the sentences that do each job. You judge whether they do it well enough. If it cannot find one, that part may need work.',
      fields: [
        { id: 'story', label: 'Your story', multiline: true, rows: 14, placeholder: 'Paste your 500–1000 word story here…' },
      ],
      ai: {
        // Small models judge quality poorly but can find evidence, so the learner does the judging.
        button: 'Find the key moments',
        prompt: (v) => ({
          system: 'You are a careful reading assistant. You quote sentences from a story exactly. No preamble.',
          user:
            `Story:\n"""\n${v.story}\n"""\n\n` +
            'Find these moments in the story. For each line, copy one short sentence from the story exactly, in quotes. ' +
            'If the story has no such sentence, write "Not found". Write 6 lines:\n' +
            'Line 1 starts "What the character wants:"\n' +
            'Line 2 starts "The first obstacle:"\n' +
            'Line 3 starts "Things get worse:"\n' +
            'Line 4 starts "The climax:"\n' +
            'Line 5 starts "A feeling shown, not named:"\n' +
            'Line 6 starts "The last image:"',
          prefill: 'What the character wants:',
          maxTokens: 350,
        }),
      },
    },
  },
];
