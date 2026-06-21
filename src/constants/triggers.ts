// Canonical onboarding trigger IDs and their 1:1 mapping to the PT keys
// already used by the diary/SOS (diaryStore entries store PT keys like
// 'Estresse'; we do NOT migrate existing entries, only map at the UI layer).
export const TRIGGER_IDS = ['stress', 'coffee', 'alcohol', 'meal', 'boredom', 'social', 'work', 'anxiety'] as const;
export type TriggerId = typeof TRIGGER_IDS[number];

// Index-aligned with TRIGGER_IDS — same order as diary.tsx's TRIGGER_KEYS today.
const DIARY_KEYS = ['Estresse', 'Café', 'Álcool', 'Pós-refeição', 'Tédio', 'Social', 'Trabalho', 'Ansiedade'];

export const TRIGGER_ID_TO_DIARY_KEY: Record<TriggerId, string> =
  Object.fromEntries(TRIGGER_IDS.map((id, i) => [id, DIARY_KEYS[i]])) as Record<TriggerId, string>;
