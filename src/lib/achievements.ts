export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  category: 'time' | 'savings' | 'diary';
}

export interface AchievementContext {
  hoursSinceQuit: number;
  daysSinceQuit: number;
  cigarettesNotSmoked: number;
  moneySaved: number;
  cravingsWon: number;
  diaryEntries: number;
}

/** Static achievement data — title/desc are kept as Portuguese fallbacks.
 *  Use getTranslatedAchievements(t) in components to get translated strings. */
export const ACHIEVEMENTS: Achievement[] = [
  // ── Tempo ─────────────────────────────────────────────────────────────────
  { id: 'h12',   title: 'Primeira Noite',           desc: '12 horas sem fumar',           icon: '🌙', category: 'time' },
  { id: 'h24',   title: 'Primeiro Amanhecer',        desc: '24 horas sem fumar',           icon: '🌅', category: 'time' },
  { id: 'd2',    title: 'Dois Dias de Força',         desc: '2 dias sem fumar',             icon: '🌤️', category: 'time' },
  { id: 'd3',    title: 'Três Dias Forte',            desc: '3 dias sem fumar',             icon: '💪', category: 'time' },
  { id: 'w1',    title: 'Uma Semana',                 desc: '7 dias sem fumar',             icon: '⭐', category: 'time' },
  { id: 'w2',    title: 'Quinze Dias',                desc: '15 dias sem fumar',            icon: '🌟', category: 'time' },
  { id: 'm1',    title: 'Um Mês Livre',               desc: '30 dias sem fumar',            icon: '🏆', category: 'time' },
  { id: 'm2',    title: 'Dois Meses Livre',           desc: '60 dias sem fumar',            icon: '🍀', category: 'time' },
  { id: 'm3',    title: 'Noventa Dias',               desc: '90 dias sem fumar',            icon: '🥇', category: 'time' },
  { id: 'm6',    title: 'Meio Ano',                   desc: '180 dias sem fumar',           icon: '🎖️', category: 'time' },
  { id: 'y1',    title: 'Um Ano',                     desc: '365 dias sem fumar',           icon: '👑', category: 'time' },
  { id: 'y2',    title: 'Dois Anos de Vida Nova',     desc: '2 anos sem fumar',             icon: '🦋', category: 'time' },
  { id: 'y5',    title: 'Cinco Anos Livre',           desc: '5 anos sem fumar',             icon: '🌳', category: 'time' },

  // ── Cigarros não fumados ───────────────────────────────────────────────────
  { id: 'cig10',   title: 'Primeiros Dez',            desc: '10 cigarros não fumados',      icon: '🚭', category: 'savings' },
  { id: 'cig50',   title: 'Meio Maço',                desc: '50 cigarros não fumados',      icon: '✌️', category: 'savings' },
  { id: 'cig100',  title: 'Centena',                  desc: '100 cigarros não fumados',     icon: '💯', category: 'savings' },
  { id: 'cig200',  title: 'Duzentos e Contando',      desc: '200 cigarros não fumados',     icon: '🌱', category: 'savings' },
  { id: 'cig500',  title: 'Quinhentos',               desc: '500 cigarros não fumados',     icon: '🌿', category: 'savings' },
  { id: 'cig1000', title: 'Um Milhar',                desc: '1000 cigarros não fumados',    icon: '🏅', category: 'savings' },

  // ── Dinheiro ──────────────────────────────────────────────────────────────
  { id: 'r20',    title: 'Primeiro Dinheiro',          desc: 'R$20 economizados',            icon: '💰', category: 'savings' },
  { id: 'r50',    title: 'Cinquenta Reais',            desc: 'R$50 economizados',            icon: '💸', category: 'savings' },
  { id: 'r100',   title: 'Uma Nota',                   desc: 'R$100 economizados',           icon: '💵', category: 'savings' },
  { id: 'r200',   title: 'Duzentos Economizados',      desc: 'R$200 economizados',           icon: '🏦', category: 'savings' },
  { id: 'r500',   title: 'Poupança Real',              desc: 'R$500 economizados',           icon: '💎', category: 'savings' },
  { id: 'r1000',  title: 'Quatro Dígitos',             desc: 'R$1.000 economizados',         icon: '🥂', category: 'savings' },
  { id: 'r2000',  title: 'Investimento Real',          desc: 'R$2.000 economizados',         icon: '🚀', category: 'savings' },

  // ── Diário & resistência ──────────────────────────────────────────────────
  { id: 'res1',    title: 'Primeira Vitória',          desc: 'Primeira fissura vencida',     icon: '🛡️', category: 'diary' },
  { id: 'res5',    title: 'Cinco Vitórias',            desc: '5 fissuras vencidas',          icon: '⚡', category: 'diary' },
  { id: 'res10',   title: 'Guardião',                  desc: '10 fissuras vencidas',         icon: '⚔️', category: 'diary' },
  { id: 'res25',   title: 'Veterano',                  desc: '25 fissuras vencidas',         icon: '🎯', category: 'diary' },
  { id: 'res50',   title: 'Mestre da Resistência',     desc: '50 fissuras vencidas',         icon: '🦅', category: 'diary' },
  { id: 'res100',  title: 'Invencível',                desc: '100 fissuras vencidas',        icon: '🔱', category: 'diary' },
  { id: 'diary1',  title: 'Primeiro Registro',         desc: 'Primeiro registro no diário',  icon: '📝', category: 'diary' },
  { id: 'diary5',  title: 'Cronista',                  desc: '5 registros no diário',        icon: '📓', category: 'diary' },
  { id: 'diary10', title: 'Dez Registros',             desc: '10 registros no diário',       icon: '📚', category: 'diary' },
  { id: 'diary20', title: 'Diário Fiel',               desc: '20 registros no diário',       icon: '📖', category: 'diary' },
  { id: 'diary50', title: 'Cronista Fiel',             desc: '50 registros no diário',       icon: '📔', category: 'diary' },
];

/**
 * Returns the ACHIEVEMENTS array with title and desc resolved via i18next's `t()` function.
 * Call this inside a component that has access to `useTranslation()`.
 */
export function getTranslatedAchievements(t: (key: string) => string): Achievement[] {
  return ACHIEVEMENTS.map(a => ({
    ...a,
    title: t(`achievements.${a.id}.title`),
    desc: t(`achievements.${a.id}.desc`),
  }));
}

/** Returns ids of all achievements that should be unlocked given the current context */
export function getEarnedIds(ctx: AchievementContext): string[] {
  const { hoursSinceQuit, daysSinceQuit, cigarettesNotSmoked, moneySaved, cravingsWon, diaryEntries } = ctx;
  const earned: string[] = [];

  // Time
  if (hoursSinceQuit >= 12)   earned.push('h12');
  if (daysSinceQuit >= 1)     earned.push('h24');
  if (daysSinceQuit >= 2)     earned.push('d2');
  if (daysSinceQuit >= 3)     earned.push('d3');
  if (daysSinceQuit >= 7)     earned.push('w1');
  if (daysSinceQuit >= 15)    earned.push('w2');
  if (daysSinceQuit >= 30)    earned.push('m1');
  if (daysSinceQuit >= 60)    earned.push('m2');
  if (daysSinceQuit >= 90)    earned.push('m3');
  if (daysSinceQuit >= 180)   earned.push('m6');
  if (daysSinceQuit >= 365)   earned.push('y1');
  if (daysSinceQuit >= 730)   earned.push('y2');
  if (daysSinceQuit >= 1825)  earned.push('y5');

  // Cigarettes not smoked
  if (cigarettesNotSmoked >= 10)   earned.push('cig10');
  if (cigarettesNotSmoked >= 50)   earned.push('cig50');
  if (cigarettesNotSmoked >= 100)  earned.push('cig100');
  if (cigarettesNotSmoked >= 200)  earned.push('cig200');
  if (cigarettesNotSmoked >= 500)  earned.push('cig500');
  if (cigarettesNotSmoked >= 1000) earned.push('cig1000');

  // Money saved
  if (moneySaved >= 20)   earned.push('r20');
  if (moneySaved >= 50)   earned.push('r50');
  if (moneySaved >= 100)  earned.push('r100');
  if (moneySaved >= 200)  earned.push('r200');
  if (moneySaved >= 500)  earned.push('r500');
  if (moneySaved >= 1000) earned.push('r1000');
  if (moneySaved >= 2000) earned.push('r2000');

  // Cravings won
  if (cravingsWon >= 1)   earned.push('res1');
  if (cravingsWon >= 5)   earned.push('res5');
  if (cravingsWon >= 10)  earned.push('res10');
  if (cravingsWon >= 25)  earned.push('res25');
  if (cravingsWon >= 50)  earned.push('res50');
  if (cravingsWon >= 100) earned.push('res100');

  // Diary entries
  if (diaryEntries >= 1)  earned.push('diary1');
  if (diaryEntries >= 5)  earned.push('diary5');
  if (diaryEntries >= 10) earned.push('diary10');
  if (diaryEntries >= 20) earned.push('diary20');
  if (diaryEntries >= 50) earned.push('diary50');

  return earned;
}
