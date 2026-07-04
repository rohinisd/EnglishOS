/**
 * EnglishForge — Curriculum Seed Script
 * ============================================================================
 * Seeds the complete 20-session English Mastery Program into the database.
 *
 * Run:   npm run seed
 *
 * This script is idempotent — run it as many times as you like without
 * creating duplicates. It uses upsert on unique keys (course.slug,
 * session.sequence, badge.slug).
 * ============================================================================
 */

import { PrismaClient, SkillArea, LessonType, SubmissionType } from "@prisma/client";
import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";

const db = new PrismaClient();
const SESSION_NOTES_DIR = path.join(process.cwd(), "content", "sessions");
let sessionNoteFiles: string[] | null = null;

function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (raw.trim().startsWith("+")) return raw.replace(/[^+\d]/g, "");
  return `+${digits}`;
}

function getSessionNote(sequence: number): string | null {
  if (!existsSync(SESSION_NOTES_DIR)) return null;
  sessionNoteFiles ??= readdirSync(SESSION_NOTES_DIR);
  const prefix = `session-${sequence.toString().padStart(2, "0")}-`;
  const file = sessionNoteFiles.find(name => name.startsWith(prefix) && name.endsWith(".md"));
  if (!file) return null;
  return readFileSync(path.join(SESSION_NOTES_DIR, file), "utf8").trim();
}

// ============================================================================
// 1. COURSE
// ============================================================================

const COURSE = {
  slug: "english-mastery",
  title: "English Mastery Program",
  subtitle: "Grammar · Cursive · Writing · Speaking",
  description:
    "A 2-month, 40-hour complete English program for CBSE/ICSE students of " +
    "Classes 8, 9, and 10. Covers all grammar, transforms handwriting with " +
    "cursive drills, builds 14 writing formats, and grows confident " +
    "speakers — from shy to stage-ready.",
  durationWeeks: 8,
  totalHours: 40,
  priceMonthly: 100000, // ₹1000 in paise
  priceFull: 180000,    // ₹1800 in paise
  coverUrl: null as string | null,
};

// ============================================================================
// 2. SESSIONS (the full 20-session map)
// ============================================================================

type SessionSpec = {
  sequence: number;
  title: string;
  subtitle?: string;
  grammarFocus: string;
  cursiveDrill: string;
  speakingActivity: string;
  writingFormat: string;
  writingPrompt: string;
  wordCountMin: number;
  wordCountMax: number;
  skills: SkillArea[];
};

const SESSIONS: SessionSpec[] = [
  {
    sequence: 1,
    title: "Parts of Speech — Overview & Noun",
    grammarFocus: "Parts of speech, Noun (types, gender, number)",
    cursiveDrill: "Posture, pen grip, basic strokes",
    speakingActivity: "Self-introduction (60 seconds)",
    writingFormat: "Paragraph",
    writingPrompt: "Write a paragraph on 'Myself' covering your hobbies, family, and dreams.",
    wordCountMin: 80,
    wordCountMax: 150,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 2,
    title: "Pronoun + Verb",
    grammarFocus: "Pronouns (types), Verbs (main vs helping)",
    cursiveDrill: "Wave letters: c, a, d, g, o",
    speakingActivity: "Tongue twisters + picture talk",
    writingFormat: "Message writing",
    writingPrompt:
      "You received a phone call for your mother from a family friend. Write a message (50 words) for your mother with the details.",
    wordCountMin: 40,
    wordCountMax: 60,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 3,
    title: "Adjective + Adverb (with degrees)",
    grammarFocus: "Adjective types, degrees of comparison, adverb types",
    cursiveDrill: "Peak letters: i, u, t, s",
    speakingActivity: "Show and Tell",
    writingFormat: "Notice writing",
    writingPrompt:
      "You are the Head Girl/Boy. Write a notice for the school notice board announcing an inter-school debate competition.",
    wordCountMin: 50,
    wordCountMax: 80,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 4,
    title: "Preposition + Conjunction + Interjection",
    grammarFocus: "Prepositions, conjunctions (coordinating/subordinating), interjections",
    cursiveDrill: "Loop letters: l, b, h, k",
    speakingActivity: "Read-aloud with peer feedback",
    writingFormat: "Informal letter",
    writingPrompt:
      "Write an informal letter to your cousin describing your recent Diwali holidays.",
    wordCountMin: 100,
    wordCountMax: 150,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 5,
    title: "Articles + Determiners",
    grammarFocus: "A, An, The; some/any/much/many/little/few",
    cursiveDrill: "Tail letters: g, j, p, q, y",
    speakingActivity: "JAM — 1 minute talks",
    writingFormat: "Formal letter",
    writingPrompt:
      "Write a formal letter to the editor on the rising use of mobile phones by students.",
    wordCountMin: 120,
    wordCountMax: 180,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 6,
    title: "Tenses Part 1 — Simple Present / Past / Future",
    grammarFocus: "Simple tenses with signal words",
    cursiveDrill: "Uppercase A–M",
    speakingActivity: "JAM — 1 minute talks (new topics)",
    writingFormat: "Email writing",
    writingPrompt:
      "Write an email to your class teacher requesting two days of leave for attending a family function.",
    wordCountMin: 80,
    wordCountMax: 120,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 7,
    title: "Tenses Part 2 — Continuous & Perfect",
    grammarFocus: "Present/past/future continuous and perfect",
    cursiveDrill: "Uppercase N–Z",
    speakingActivity: "Storytelling (3 minutes)",
    writingFormat: "Diary entry",
    writingPrompt:
      "Write a diary entry on the day you won your first medal. Describe your feelings and the day's events.",
    wordCountMin: 100,
    wordCountMax: 150,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 8,
    title: "Tenses Part 3 — Perfect Continuous",
    grammarFocus: "Present/past/future perfect continuous",
    cursiveDrill: "Word writing + letter spacing",
    speakingActivity: "Extempore with 30-second prep",
    writingFormat: "Descriptive paragraph",
    writingPrompt:
      "Describe your favourite place using all five senses (sight, sound, smell, touch, taste).",
    wordCountMin: 100,
    wordCountMax: 150,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 9,
    title: "Subject–Verb Agreement",
    grammarFocus: "Concord: collective, indefinite, coordinate subjects",
    cursiveDrill: "Short sentence copy",
    speakingActivity: "Role play — shopkeeper and customer",
    writingFormat: "Descriptive essay",
    writingPrompt:
      "Write a descriptive essay on a place you visited recently that left a lasting impression.",
    wordCountMin: 150,
    wordCountMax: 250,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 10,
    title: "Active ↔ Passive Voice",
    grammarFocus: "Voice transformation across all tenses",
    cursiveDrill: "Short sentence copy — speed",
    speakingActivity: "Role play — mock interview",
    writingFormat: "Story writing",
    writingPrompt:
      "Continue the story: 'The door creaked open at midnight and…' (150 words).",
    wordCountMin: 120,
    wordCountMax: 200,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 11,
    title: "Reported Speech — Statements",
    grammarFocus: "Direct to indirect speech: statements",
    cursiveDrill: "100-word passage copy",
    speakingActivity: "News reading",
    writingFormat: "Story writing (revise)",
    writingPrompt:
      "Story based on the words: an old man, a small boy, and a lost dog (180 words).",
    wordCountMin: 150,
    wordCountMax: 220,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 12,
    title: "Reported Speech — Questions, Commands, Exclamations",
    grammarFocus: "Direct to indirect: non-statements",
    cursiveDrill: "100-word passage copy — neat",
    speakingActivity: "Book or movie review (2 minutes)",
    writingFormat: "Article writing",
    writingPrompt:
      "Write an article on 'Social Media: A Boon or a Bane?' for the school magazine.",
    wordCountMin: 150,
    wordCountMax: 220,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 13,
    title: "Modals",
    grammarFocus: "Can/could/may/might/must/should/would/ought to",
    cursiveDrill: "Timed copy — 10 minutes",
    speakingActivity: "Extempore (2 minutes)",
    writingFormat: "Article writing (revise)",
    writingPrompt:
      "Write an article on 'The Importance of Yoga in Student Life' (180 words).",
    wordCountMin: 150,
    wordCountMax: 220,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 14,
    title: "Clauses + Conjunctive Adverbs (Linkers)",
    grammarFocus: "Main / subordinate clauses; linkers: however, therefore, meanwhile",
    cursiveDrill: "Timed copy — 8 minutes",
    speakingActivity: "Group Discussion (fun topic)",
    writingFormat: "Speech writing",
    writingPrompt:
      "Write a speech on 'Importance of Reading' to be delivered at the morning assembly.",
    wordCountMin: 200,
    wordCountMax: 280,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 15,
    title: "Conditionals (0, 1, 2, 3, Mixed)",
    grammarFocus: "All five conditional types with real examples",
    cursiveDrill: "Timed copy — 6 minutes",
    speakingActivity: "Group Discussion (serious topic)",
    writingFormat: "Speech delivery",
    writingPrompt:
      "Write a speech on 'Why Every Student Should Learn a Musical Instrument' (200 words).",
    wordCountMin: 180,
    wordCountMax: 260,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 16,
    title: "Sentence Transformation",
    grammarFocus: "Simple↔compound↔complex; affirmative↔negative; questions",
    cursiveDrill: "Paragraph under time",
    speakingActivity: "Debate preparation + role assignment",
    writingFormat: "Report writing",
    writingPrompt:
      "Write a report on the Annual Sports Day held in your school for the school magazine.",
    wordCountMin: 150,
    wordCountMax: 220,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 17,
    title: "Editing + Omission + Jumbled Sentences",
    grammarFocus: "Board-exam error correction, omission, rearrangement",
    cursiveDrill: "Paragraph under time",
    speakingActivity: "Debate Round 1",
    writingFormat: "Report writing (revise)",
    writingPrompt:
      "Write a report on a blood donation camp organised in your school (180 words).",
    wordCountMin: 150,
    wordCountMax: 220,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 18,
    title: "Vocabulary — Idioms, Phrasal Verbs, Collocations",
    grammarFocus: "Common idioms, phrasal verbs, frequent collocations",
    cursiveDrill: "Full page writing",
    speakingActivity: "Debate Round 2",
    writingFormat: "Dialogue writing",
    writingPrompt:
      "Write a dialogue between a shopkeeper and a customer complaining about a defective product (150 words).",
    wordCountMin: 120,
    wordCountMax: 180,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 19,
    title: "Punctuation + Full Grammar Revision",
    grammarFocus: "Full stop, comma, colon, semicolon, quotes; revision drill",
    cursiveDrill: "Speed test — 100 words in 4 minutes",
    speakingActivity: "Panel-style interview",
    writingFormat: "Bio-sketch + mixed formats",
    writingPrompt:
      "Write a bio-sketch of A.P.J. Abdul Kalam using the points: born 1931, scientist, 11th President of India, wrote 'Wings of Fire', known as Missile Man.",
    wordCountMin: 120,
    wordCountMax: 180,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
  {
    sequence: 20,
    title: "Mock Exam — Grammar + Writing",
    grammarFocus: "Comprehensive board-pattern exam",
    cursiveDrill: "Final neatness evaluation",
    speakingActivity: "Elocution — final 2-minute speech on 'My Journey'",
    writingFormat: "Mock exam (formal letter + article + story excerpt)",
    writingPrompt:
      "Choose ONE: (a) Formal letter of complaint to an online store about delayed delivery, OR (b) Article on 'Plastic Pollution — A Silent Killer'.",
    wordCountMin: 180,
    wordCountMax: 280,
    skills: ["GRAMMAR", "CURSIVE", "WRITING", "SPEAKING"],
  },
];

// ============================================================================
// 3. RUBRICS
// ============================================================================

const RUBRICS = [
  {
    name: "Writing Rubric",
    description: "Standard rubric for all writing submissions",
    skillArea: "WRITING" as SkillArea,
    criteria: [
      { id: "format", name: "Format", description: "Correct format for the writing type", maxScore: 2, weight: 1 },
      { id: "content", name: "Content", description: "Relevant, complete, creative", maxScore: 3, weight: 1 },
      { id: "grammar", name: "Grammar & Spelling", description: "Accurate grammar and spelling", maxScore: 2, weight: 1 },
      { id: "vocabulary", name: "Vocabulary & Expression", description: "Varied, appropriate word choice", maxScore: 2, weight: 1 },
      { id: "neatness", name: "Neatness & Handwriting", description: "Clear, legible presentation", maxScore: 1, weight: 1 },
    ],
  },
  {
    name: "Speaking Rubric",
    description: "Standard rubric for all speaking submissions",
    skillArea: "SPEAKING" as SkillArea,
    criteria: [
      { id: "content", name: "Content & Structure", description: "Ideas organised logically", maxScore: 3, weight: 1 },
      { id: "fluency", name: "Fluency", description: "Smooth, natural delivery", maxScore: 2, weight: 1 },
      { id: "pronunciation", name: "Pronunciation & Clarity", description: "Clear articulation", maxScore: 2, weight: 1 },
      { id: "grammar", name: "Grammar & Vocabulary", description: "Accurate spoken language", maxScore: 2, weight: 1 },
      { id: "confidence", name: "Body Language & Confidence", description: "Poise and engagement", maxScore: 1, weight: 1 },
    ],
  },
  {
    name: "Cursive Rubric",
    description: "Standard rubric for all cursive handwriting submissions",
    skillArea: "CURSIVE" as SkillArea,
    criteria: [
      { id: "slant", name: "Slant", description: "Consistent forward slant", maxScore: 2, weight: 1 },
      { id: "size", name: "Size Uniformity", description: "Uniform letter heights", maxScore: 2, weight: 1 },
      { id: "spacing", name: "Spacing", description: "Even spacing between letters and words", maxScore: 2, weight: 1 },
      { id: "forms", name: "Letter Forms", description: "Correct cursive letter shapes", maxScore: 2, weight: 1 },
      { id: "neatness", name: "Overall Neatness", description: "Clean, presentable work", maxScore: 2, weight: 1 },
    ],
  },
];

// ============================================================================
// 4. QUIZ QUESTIONS — Real content for Sessions 1–5, placeholders for 6–20
// ============================================================================

type QuizQ = {
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
};

const QUIZZES: Record<number, QuizQ[]> = {
  1: [
    {
      prompt: "Which of the following is a collective noun?",
      options: ["Boy", "Team", "River", "Happiness"],
      correct: "Team",
      explanation: "A collective noun names a group treated as a single unit.",
    },
    {
      prompt: "Identify the abstract noun: 'Her honesty won everyone's trust.'",
      options: ["Her", "Honesty", "Won", "Everyone"],
      correct: "Honesty",
      explanation: "Abstract nouns name qualities, ideas, or feelings — you cannot see or touch them.",
    },
    {
      prompt: "The plural of 'child' is:",
      options: ["Childs", "Childen", "Children", "Childes"],
      correct: "Children",
      explanation: "'Children' is an irregular plural form, like 'men', 'women', 'feet'.",
    },
    {
      prompt: "Which sentence uses a proper noun correctly?",
      options: [
        "We visited the taj mahal last summer.",
        "We visited the Taj Mahal last summer.",
        "We Visited the Taj Mahal last Summer.",
        "we visited the Taj mahal last summer.",
      ],
      correct: "We visited the Taj Mahal last summer.",
      explanation: "Proper nouns (names of specific places) are capitalized; seasons are not.",
    },
    {
      prompt: "The possessive form of 'boys' (belonging to many boys) is:",
      options: ["Boy's", "Boys'", "Boys's", "Boys"],
      correct: "Boys'",
      explanation: "For plural nouns ending in -s, add only an apostrophe after the s.",
    },
  ],
  2: [
    {
      prompt: "Choose the correct reflexive pronoun: 'She taught ___ how to paint.'",
      options: ["her", "herself", "hers", "she"],
      correct: "herself",
      explanation: "Reflexive pronouns (-self/-selves) are used when subject and object refer to the same person.",
    },
    {
      prompt: "Identify the helping verb: 'They have finished their homework.'",
      options: ["They", "have", "finished", "homework"],
      correct: "have",
      explanation: "'Have' helps the main verb 'finished' to form the present perfect tense.",
    },
    {
      prompt: "Which pronoun correctly completes: '___ is going to the market?'",
      options: ["Whom", "Who", "Whose", "Which"],
      correct: "Who",
      explanation: "'Who' is used as the subject of a question; 'whom' is used as the object.",
    },
    {
      prompt: "The verb in 'Ravi runs fast every morning' is:",
      options: ["Ravi", "runs", "fast", "morning"],
      correct: "runs",
      explanation: "'Runs' is the action verb describing what Ravi does.",
    },
    {
      prompt: "Choose the correct pronoun: 'Between you and ___, this is a secret.'",
      options: ["I", "me", "myself", "mine"],
      correct: "me",
      explanation: "After prepositions like 'between', we use object pronouns (me, him, her, us, them).",
    },
  ],
  3: [
    {
      prompt: "The superlative degree of 'good' is:",
      options: ["gooder", "more good", "best", "goodest"],
      correct: "best",
      explanation: "'Good' has irregular degrees: good → better → best.",
    },
    {
      prompt: "Identify the adverb: 'She sings beautifully.'",
      options: ["She", "sings", "beautifully", "None"],
      correct: "beautifully",
      explanation: "Adverbs of manner often end in -ly and describe how an action is performed.",
    },
    {
      prompt: "Which adjective is a demonstrative adjective?",
      options: ["red", "beautiful", "this", "five"],
      correct: "this",
      explanation: "Demonstrative adjectives (this/that/these/those) point out specific nouns.",
    },
    {
      prompt: "Choose the correct comparative: 'Delhi is ___ than Mumbai in summer.'",
      options: ["hot", "hotter", "hottest", "more hot"],
      correct: "hotter",
      explanation: "For short adjectives (one syllable), add -er to form the comparative.",
    },
    {
      prompt: "The word 'quickly' in 'He ran quickly' modifies which word?",
      options: ["He", "ran", "Both", "None"],
      correct: "ran",
      explanation: "Adverbs of manner modify verbs — 'quickly' describes how he ran.",
    },
  ],
  4: [
    {
      prompt: "Choose the correct preposition: 'She is good ___ mathematics.'",
      options: ["in", "at", "on", "for"],
      correct: "at",
      explanation: "'Good at' is the fixed expression for being skilled in something.",
    },
    {
      prompt: "Which is a subordinating conjunction?",
      options: ["and", "but", "because", "or"],
      correct: "because",
      explanation: "Subordinating conjunctions (because, although, if, when) introduce dependent clauses.",
    },
    {
      prompt: "The interjection in 'Hurray! We won the match.' is:",
      options: ["Hurray", "We", "won", "match"],
      correct: "Hurray",
      explanation: "Interjections express sudden emotion and are usually followed by an exclamation mark.",
    },
    {
      prompt: "Choose the correct conjunction: 'He is poor ___ honest.'",
      options: ["and", "but", "or", "so"],
      correct: "but",
      explanation: "'But' shows contrast between two qualities or ideas.",
    },
    {
      prompt: "The preposition in 'The book is on the table' is:",
      options: ["The", "book", "on", "table"],
      correct: "on",
      explanation: "'On' shows the spatial relationship between the book and the table.",
    },
  ],
  5: [
    {
      prompt: "Choose the correct article: 'He is ___ honest man.'",
      options: ["a", "an", "the", "no article"],
      correct: "an",
      explanation: "Use 'an' before words starting with a vowel sound. 'Honest' begins with a silent 'h'.",
    },
    {
      prompt: "Which is correct: 'She bought ___ new car.'",
      options: ["a", "an", "the", "no article"],
      correct: "a",
      explanation: "Use 'a' before consonant sounds. A new (unspecified) car takes 'a'.",
    },
    {
      prompt: "Choose the correct determiner: 'I have ___ money to buy lunch.'",
      options: ["many", "few", "little", "several"],
      correct: "little",
      explanation: "'Little' is used with uncountable nouns like 'money' in a negative sense.",
    },
    {
      prompt: "Which sentence is correct?",
      options: [
        "The sun rises in east.",
        "Sun rises in east.",
        "The sun rises in the east.",
        "A sun rises in the east.",
      ],
      correct: "The sun rises in the east.",
      explanation: "Use 'the' with unique things (sun) and with directions (east).",
    },
    {
      prompt: "Choose the correct determiner: 'There are ___ students in the class today.'",
      options: ["much", "little", "few", "a little"],
      correct: "few",
      explanation: "'Few' is used with countable plural nouns like 'students'.",
    },
  ],
  // Placeholder questions for sessions 6–20 — teacher will replace
  6: placeholderQuestions("Tenses — Simple Present / Past / Future"),
  7: placeholderQuestions("Tenses — Continuous & Perfect"),
  8: placeholderQuestions("Tenses — Perfect Continuous"),
  9: placeholderQuestions("Subject–Verb Agreement"),
  10: placeholderQuestions("Active and Passive Voice"),
  11: placeholderQuestions("Reported Speech — Statements"),
  12: placeholderQuestions("Reported Speech — Questions & Commands"),
  13: placeholderQuestions("Modals"),
  14: placeholderQuestions("Clauses + Conjunctive Adverbs"),
  15: placeholderQuestions("Conditionals"),
  16: placeholderQuestions("Sentence Transformation"),
  17: placeholderQuestions("Editing & Omission"),
  18: placeholderQuestions("Vocabulary — Idioms & Phrasal Verbs"),
  19: placeholderQuestions("Punctuation & Revision"),
  20: placeholderQuestions("Mock Exam Preparation"),
};

function placeholderQuestions(topic: string): QuizQ[] {
  return Array.from({ length: 5 }, (_, i) => ({
    prompt: `[PLACEHOLDER Q${i + 1}] ${topic} — Teacher to fill in.`,
    options: ["A", "B", "C", "D"],
    correct: "A",
    explanation: "Teacher to add real explanation.",
  }));
}

function makeQuestion(prompt: string, correct: string, distractors: string[], explanation: string): QuizQ {
  const options = [correct, ...distractors].filter((value, index, all) => all.indexOf(value) === index).slice(0, 4);
  while (options.length < 4) options.push(`Option ${options.length + 1}`);
  return { prompt, options, correct, explanation };
}

function generatedQuestions(s: SessionSpec): QuizQ[] {
  const topic = s.grammarFocus;
  const writing = s.writingFormat;
  const speaking = s.speakingActivity;
  const cursive = s.cursiveDrill;

  return [
    makeQuestion(
      `What is the main grammar focus of Session ${s.sequence}?`,
      topic,
      [writing, speaking, cursive],
      `This session's grammar focus is ${topic}.`,
    ),
    makeQuestion(
      `Which writing format is practised in Session ${s.sequence}?`,
      writing,
      ["Formal letter", "Dialogue writing", "Report writing"],
      `The writing task for this session practises ${writing}.`,
    ),
    makeQuestion(
      `Which speaking activity belongs to Session ${s.sequence}?`,
      speaking,
      ["Debate Round 2", "News reading", "Picture talk"],
      `The speaking activity is ${speaking}.`,
    ),
    makeQuestion(
      `Which cursive drill should students practise in Session ${s.sequence}?`,
      cursive,
      ["Uppercase A-M", "Full page writing", "Timed copy"],
      `The cursive drill is ${cursive}.`,
    ),
    makeQuestion(
      `What should students focus on before writing the homework for Session ${s.sequence}?`,
      "Plan the answer and follow the required format",
      ["Write without reading the question", "Ignore word limits", "Use only one sentence"],
      "Planning and format help make writing clear and complete.",
    ),
    makeQuestion(
      "Which habit improves grammar accuracy?",
      "Checking subject, verb, tense, and punctuation",
      ["Writing as fast as possible", "Skipping revision", "Avoiding examples"],
      "Grammar improves when students check the structure of each sentence.",
    ),
    makeQuestion(
      "What is the best way to handle a common mistake?",
      "Notice the error, correct it, and practise a similar sentence",
      ["Memorise without understanding", "Leave the sentence unchanged", "Avoid the topic"],
      "Correction plus practice helps the rule become natural.",
    ),
    makeQuestion(
      "Why are examples useful in English learning?",
      "They show how a rule works in real sentences",
      ["They replace practice", "They remove the need to write", "They are only for exams"],
      "Examples connect grammar rules to actual usage.",
    ),
    makeQuestion(
      "What should a strong answer include?",
      "Relevant points, correct grammar, and clear structure",
      ["Only difficult words", "Only long sentences", "No punctuation"],
      "Strong answers are clear, relevant, and well organised.",
    ),
    makeQuestion(
      "Which action helps speaking confidence?",
      "Practising aloud with a clear beginning, middle, and ending",
      ["Speaking too fast", "Avoiding eye contact always", "Reading silently only"],
      "Speaking confidence grows through organised oral practice.",
    ),
    makeQuestion(
      "What is the goal of cursive practice?",
      "Neat, consistent, and readable handwriting",
      ["Writing untidily but fast", "Changing letter size every word", "Pressing the pen very hard"],
      "Good cursive balances neatness, spacing, and consistency.",
    ),
    makeQuestion(
      "What should students do after learning a rule?",
      "Apply it in original sentences",
      ["Forget the examples", "Only underline the heading", "Skip practice"],
      "Applying rules in new sentences builds real understanding.",
    ),
    makeQuestion(
      "Which is a good revision method?",
      "Review notes, redo examples, and correct mistakes",
      ["Only read headings", "Do all work at the last minute", "Avoid difficult questions"],
      "Revision is strongest when students actively practise and correct.",
    ),
    makeQuestion(
      "What makes homework complete?",
      "Answering the prompt fully within the given word range",
      ["Writing unrelated points", "Submitting a blank page", "Ignoring the prompt"],
      "Complete homework follows the prompt and word guidance.",
    ),
    makeQuestion(
      "What should students check before submitting writing?",
      "Format, grammar, spelling, punctuation, and word count",
      ["Only page colour", "Only handwriting speed", "Only the first sentence"],
      "Final checking improves both clarity and marks.",
    ),
    makeQuestion(
      "How should students treat difficult topics?",
      "Break them into smaller rules and practise step by step",
      ["Skip them permanently", "Guess every answer", "Stop revising"],
      "Step-by-step practice makes difficult topics easier.",
    ),
    makeQuestion(
      "What is the best way to learn vocabulary from this course?",
      "Use new words in speaking and writing",
      ["Only copy words once", "Never revise meanings", "Avoid using new words"],
      "Vocabulary becomes active when students use it.",
    ),
    makeQuestion(
      "Why should students read the question carefully?",
      "To understand the exact task before answering",
      ["To waste time", "To avoid writing", "To copy the question only"],
      "Careful reading prevents wrong or incomplete answers.",
    ),
    makeQuestion(
      "Which practice supports exam readiness?",
      "Timed writing, grammar drills, and revision",
      ["No practice before exams", "Only watching lessons", "Ignoring feedback"],
      "Exam readiness needs timed practice and feedback-based revision.",
    ),
    makeQuestion(
      "What is the main learning approach of each session?",
      "Understand, practise, speak, write, and revise",
      ["Memorise without practice", "Only complete quizzes", "Only watch once"],
      "The course builds skill through understanding and repeated practice.",
    ),
  ];
}

function quizQuestionsForSession(s: SessionSpec): QuizQ[] {
  const authored = s.sequence <= 5 ? (QUIZZES[s.sequence] ?? []) : [];
  const supplemental = generatedQuestions(s).filter(q => !authored.some(existing => existing.prompt === q.prompt));
  return [...authored, ...supplemental].slice(0, 20);
}

// ============================================================================
// 5. BADGES
// ============================================================================

const BADGES = [
  { slug: "first-video", name: "First Class", description: "Watch your first session video", criteria: { type: "video_watched", count: 1 } },
  { slug: "first-submission", name: "First Submission", description: "Submit your first homework", criteria: { type: "submissions", count: 1 } },
  { slug: "7-day-streak", name: "Week Warrior", description: "Active 7 days in a row", criteria: { type: "streak", days: 7 } },
  { slug: "14-day-streak", name: "On Fire", description: "Active 14 days in a row", criteria: { type: "streak", days: 14 } },
  { slug: "grammar-master", name: "Grammar Master", description: "Score 80%+ average on all grammar quizzes", criteria: { type: "quiz_avg", threshold: 0.8 } },
  { slug: "cursive-champion", name: "Cursive Champion", description: "All cursive submissions graded 7+/10", criteria: { type: "cursive_all", threshold: 7 } },
  { slug: "writing-wordsmith", name: "Wordsmith", description: "All writing submissions graded 7+/10", criteria: { type: "writing_all", threshold: 7 } },
  { slug: "speaking-star", name: "Speaking Star", description: "All speaking submissions graded 7+/10", criteria: { type: "speaking_all", threshold: 7 } },
  { slug: "perfect-attendance", name: "Perfect Attendance", description: "Watch all 20 videos to 95%+ completion", criteria: { type: "all_videos_completed" } },
  { slug: "top-of-class", name: "Top of Class", description: "Rank #1 in your cohort leaderboard at course end", criteria: { type: "leaderboard_rank", rank: 1 } },
];

// ============================================================================
// 6. SEED RUNNER
// ============================================================================

async function main() {
  console.log("🌱 Seeding EnglishForge curriculum...\n");

  // ---- Course --------------------------------------------------------------
  const course = await db.course.upsert({
    where: { slug: COURSE.slug },
    create: COURSE,
    update: COURSE,
  });
  console.log(`✅ Course: ${course.title}`);

  // ---- Rubrics -------------------------------------------------------------
  const rubricMap = new Map<SkillArea, string>();
  for (const r of RUBRICS) {
    // Rubric has no unique key on name — so find or create manually.
    const existing = await db.rubric.findFirst({ where: { name: r.name } });
    const row = existing
      ? await db.rubric.update({ where: { id: existing.id }, data: r })
      : await db.rubric.create({ data: r });
    rubricMap.set(r.skillArea, row.id);
    console.log(`✅ Rubric: ${r.name}`);
  }

  // ---- Sessions + Lessons + Videos + Assignments + Quizzes -----------------
  for (const s of SESSIONS) {
    const session = await db.session.upsert({
      where: { courseId_sequence: { courseId: course.id, sequence: s.sequence } },
      create: {
        courseId: course.id,
        sequence: s.sequence,
        title: s.title,
        subtitle: s.subtitle ?? null,
        grammarFocus: s.grammarFocus,
        cursiveDrill: s.cursiveDrill,
        speakingActivity: s.speakingActivity,
        writingFormat: s.writingFormat,
        skills: s.skills,
      },
      update: {
        title: s.title,
        grammarFocus: s.grammarFocus,
        cursiveDrill: s.cursiveDrill,
        speakingActivity: s.speakingActivity,
        writingFormat: s.writingFormat,
        skills: s.skills,
      },
    });

    // Lesson + Video shell
    let lesson = await db.lesson.findFirst({
      where: { sessionId: session.id, type: "VIDEO" },
    });
    if (!lesson) {
      lesson = await db.lesson.create({
        data: {
          sessionId: session.id,
          type: "VIDEO",
          title: s.title,
          order: 0,
        },
      });
      await db.video.create({
        data: {
          lessonId: lesson.id,
        },
      });
    }

    // Topic notes from cleaned markdown files
    const sessionNote = getSessionNote(s.sequence);
    if (sessionNote) {
      const title = `Session ${s.sequence} Notes`;
      const existingReading = await db.lesson.findFirst({
        where: { sessionId: session.id, type: "READING" },
      });
      if (existingReading) {
        await db.lesson.update({
          where: { id: existingReading.id },
          data: { title, description: sessionNote },
        });
      } else {
        const maxOrder = await db.lesson.aggregate({
          where: { sessionId: session.id },
          _max: { order: true },
        });
        await db.lesson.create({
          data: {
            sessionId: session.id,
            type: "READING",
            title,
            description: sessionNote,
            order: (maxOrder._max.order ?? 0) + 1,
          },
        });
      }

      if (!session.publishedAt) {
        await db.session.update({
          where: { id: session.id },
          data: { publishedAt: new Date() },
        });
      }
    }

    // Writing assignment
    const existingAssignment = await db.assignment.findFirst({
      where: { sessionId: session.id, type: "WRITING" },
    });
    const assignmentData = {
      sessionId: session.id,
      type: "WRITING" as SubmissionType,
      title: s.writingFormat,
      prompt: s.writingPrompt,
      wordCountMin: s.wordCountMin,
      wordCountMax: s.wordCountMax,
      rubricId: rubricMap.get("WRITING")!,
      maxScore: 10,
    };
    if (existingAssignment) {
      await db.assignment.update({
        where: { id: existingAssignment.id },
        data: assignmentData,
      });
    } else {
      await db.assignment.create({ data: assignmentData });
    }

    const existingSpeakingAssignment = await db.assignment.findFirst({
      where: { sessionId: session.id, type: "SPEAKING" },
    });
    const speakingAssignmentData = {
      sessionId: session.id,
      type: "SPEAKING" as SubmissionType,
      title: s.speakingActivity,
      prompt: `Record yourself doing this speaking activity: ${s.speakingActivity}. Speak clearly, organise your thoughts, and aim for 1 to 2 minutes.`,
      instructions: "Keep your voice clear. Start with a short introduction, include 2 to 3 main points, and end with a closing sentence.",
      durationSecMin: 60,
      durationSecMax: 120,
      rubricId: rubricMap.get("SPEAKING")!,
      maxScore: 10,
    };
    if (existingSpeakingAssignment) {
      await db.assignment.update({
        where: { id: existingSpeakingAssignment.id },
        data: speakingAssignmentData,
      });
    } else {
      await db.assignment.create({ data: speakingAssignmentData });
    }

    // Quiz + Questions
    let quiz = await db.quiz.findFirst({ where: { sessionId: session.id } });
    const quizData = {
      title: `Quiz — ${s.title}`,
      description: `20 questions on ${s.grammarFocus}`,
      durationSec: 1200,
      passingScore: 60,
      maxAttempts: 3,
    };
    if (!quiz) {
      quiz = await db.quiz.create({
        data: {
          sessionId: session.id,
          ...quizData,
        },
      });
    } else {
      quiz = await db.quiz.update({
        where: { id: quiz.id },
        data: quizData,
      });
    }

    // Upsert questions (delete + re-create for simplicity; safe for placeholders)
    await db.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
    const qs = quizQuestionsForSession(s);
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      await db.quizQuestion.create({
        data: {
          quizId: quiz.id,
          order: i,
          kind: "MCQ_SINGLE",
          prompt: q.prompt,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          marks: 1,
        },
      });
    }

    console.log(`✅ Session ${s.sequence}: ${s.title}`);
  }

  // ---- Badges --------------------------------------------------------------
  for (const b of BADGES) {
    await db.badge.upsert({
      where: { slug: b.slug },
      create: b,
      update: { name: b.name, description: b.description, criteria: b.criteria },
    });
    console.log(`🏅 Badge: ${b.name}`);
  }

  // ---- Promote admin user (if env set) -------------------------------------
  if (process.env.ADMIN_PHONE) {
    const phone = normalisePhone(process.env.ADMIN_PHONE);
    const admins = await db.user.updateMany({
      where: { phone },
      data: { role: "ADMIN", approvalStatus: "APPROVED", approvedAt: new Date() },
    });
    console.log(`👑 Promoted ${admins.count} user(s) to ADMIN`);
  }

  console.log("\n🎉 Seed complete.\n");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
