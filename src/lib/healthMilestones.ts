import { Colors } from '@/src/constants/colors';

export interface Milestone {
  id: string;
  thresholdMin: number;
  color: string;
}

// Fontes: American Cancer Society (ACS), NHS (UK), ASH (Action on Smoking and Health)
export const MILESTONE_DEFS: Milestone[] = [
  { id: '20min', thresholdMin: 20,      color: Colors.primary },
  { id: '8h',    thresholdMin: 480,     color: '#38BDF8' },
  { id: '12h',   thresholdMin: 720,     color: '#60A5FA' },
  { id: '24h',   thresholdMin: 1440,    color: '#4ADE80' },
  { id: '48h',   thresholdMin: 2880,    color: Colors.amber },
  { id: '3d',    thresholdMin: 4320,    color: '#F97316' },
  { id: '1w',    thresholdMin: 10080,   color: '#E879F9' },
  { id: '2w',    thresholdMin: 20160,   color: Colors.secondary },
  { id: '3w',    thresholdMin: 30240,   color: '#C084FC' },
  { id: '1m',    thresholdMin: 43200,   color: '#F472B6' },
  { id: '3m',    thresholdMin: 129600,  color: '#FB923C' },
  { id: '6m',    thresholdMin: 259200,  color: '#6EE7B7' },
  { id: '9m',    thresholdMin: 388800,  color: '#67E8F9' },
  { id: '1y',    thresholdMin: 525600,  color: '#A78BFA' },
  { id: '2y',    thresholdMin: 1051200, color: '#FBBF24' },
  { id: '5y',    thresholdMin: 2628000, color: '#34D399' },
  { id: '10y',   thresholdMin: 5256000, color: '#22D3EE' },
  { id: '15y',   thresholdMin: 7884000, color: '#FCD34D' },
  { id: '20y',   thresholdMin: 10512000, color: '#D946EF' },
];
