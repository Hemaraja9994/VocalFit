/**
 * Default Vocal Hygiene Habits
 * Based on standard clinical vocal hygiene programs
 */

import { HabitCheckItem } from '../types';

export const DEFAULT_HYGIENE_HABITS: Omit<HabitCheckItem, 'completed'>[] = [
  { id: 'vocal_nap',       label: 'Took a 10-min vocal nap' },
  { id: 'no_clearing',     label: 'Avoided throat clearing' },
  { id: 'no_caffeine',     label: 'Avoided excessive caffeine' },
  { id: 'no_smoking',      label: 'Avoided smoking / secondhand smoke' },
  { id: 'comfortable_vol', label: 'Spoke at comfortable loudness' },
  { id: 'no_whispering',   label: 'Avoided prolonged whispering' },
  { id: 'steam_inhale',    label: 'Did steam inhalation' },
  { id: 'warm_water',      label: 'Drank warm water before speaking' },
];

export const WATER_GOAL = 8; // glasses per day
