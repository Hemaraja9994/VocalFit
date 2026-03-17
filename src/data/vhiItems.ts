/**
 * Voice Handicap Index (VHI) — 30-item version
 * Jacobson et al. (1997)
 *
 * Subscales: Functional (F), Physical (P), Emotional (E)
 * Each item scored 0 (Never) to 4 (Always)
 * Total: 0–120
 */

export interface VHIItem {
  id: number;
  subscale: 'functional' | 'physical' | 'emotional';
  text: string;
}

export const VHI_ITEMS: VHIItem[] = [
  // ─── Functional Subscale (F1–F10) ────────────────────────────
  { id: 1,  subscale: 'functional', text: 'My voice makes it difficult for people to hear me.' },
  { id: 2,  subscale: 'functional', text: 'People have difficulty understanding me in a noisy room.' },
  { id: 3,  subscale: 'functional', text: 'My family has difficulty hearing me when I call them throughout the house.' },
  { id: 4,  subscale: 'functional', text: 'I use the phone less often than I would like.' },
  { id: 5,  subscale: 'functional', text: 'I tend to avoid groups of people because of my voice.' },
  { id: 6,  subscale: 'functional', text: 'I speak with friends, neighbors, or relatives less often because of my voice.' },
  { id: 7,  subscale: 'functional', text: 'People ask me to repeat myself when speaking face to face.' },
  { id: 8,  subscale: 'functional', text: 'My voice difficulties restrict my personal and social life.' },
  { id: 9,  subscale: 'functional', text: 'I feel left out of conversations because of my voice.' },
  { id: 10, subscale: 'functional', text: 'My voice problem causes me to lose income.' },

  // ─── Physical Subscale (P1–P10) ──────────────────────────────
  { id: 11, subscale: 'physical', text: 'I run out of air when I talk.' },
  { id: 12, subscale: 'physical', text: 'The sound of my voice varies throughout the day.' },
  { id: 13, subscale: 'physical', text: 'People ask, "What\'s wrong with your voice?"' },
  { id: 14, subscale: 'physical', text: 'My voice sounds creaky and dry.' },
  { id: 15, subscale: 'physical', text: 'I feel as though I have to strain to produce voice.' },
  { id: 16, subscale: 'physical', text: 'The clarity of my voice is unpredictable.' },
  { id: 17, subscale: 'physical', text: 'I try to change my voice to sound different.' },
  { id: 18, subscale: 'physical', text: 'I use a great deal of effort to speak.' },
  { id: 19, subscale: 'physical', text: 'My voice is worse in the evening.' },
  { id: 20, subscale: 'physical', text: 'My voice "gives out" on me in the middle of speaking.' },

  // ─── Emotional Subscale (E1–E10) ─────────────────────────────
  { id: 21, subscale: 'emotional', text: 'I am tense when talking to others because of my voice.' },
  { id: 22, subscale: 'emotional', text: 'People seem irritated with my voice.' },
  { id: 23, subscale: 'emotional', text: 'I find other people don\'t understand my voice problem.' },
  { id: 24, subscale: 'emotional', text: 'My voice problem upsets me.' },
  { id: 25, subscale: 'emotional', text: 'I am less outgoing because of my voice problem.' },
  { id: 26, subscale: 'emotional', text: 'My voice makes me feel handicapped.' },
  { id: 27, subscale: 'emotional', text: 'I feel annoyed when people ask me to repeat.' },
  { id: 28, subscale: 'emotional', text: 'I feel embarrassed when people ask me to repeat.' },
  { id: 29, subscale: 'emotional', text: 'My voice makes me feel incompetent.' },
  { id: 30, subscale: 'emotional', text: 'I am ashamed of my voice problem.' },
];

export const VHI_SCALE_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Almost always' },
  { value: 4, label: 'Always' },
] as const;
