import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import i18n from '@/src/i18n';
import { UserProfile } from '@/src/store/userStore';
import { CravingEntry } from '@/src/store/diaryStore';
import { parseQuitDate } from '@/src/lib/dateUtils';
import { MILESTONE_DEFS } from '@/src/lib/healthMilestones';

type NotificationsModule = typeof import('expo-notifications');

// expo-notifications throws *at import time* in Expo Go on Android (SDK 53+): its
// index re-exports a side-effecting auto-registration module that subscribes a
// device push-token listener on evaluation, which throws because remote push was
// removed from Expo Go. So we never statically import it — we lazy-require it and
// skip it entirely on web and on Android-in-Expo-Go. Notifications work normally
// in a development/standalone build; in Expo Go on Android they silently no-op.
let _mod: NotificationsModule | null | undefined;
function getNotifications(): NotificationsModule | null {
  if (_mod !== undefined) return _mod;
  if (Platform.OS === 'web' || (Platform.OS === 'android' && isRunningInExpoGo())) {
    _mod = null;
    return _mod;
  }
  try {
    _mod = require('expo-notifications') as NotificationsModule;
  } catch {
    _mod = null;
  }
  return _mod;
}

const DAILY_ID = 'libre-daily-motivational';
const CRAVING_ID = 'libre-craving-alert';
const MILESTONE_ID = 'libre-milestone';

// ── Setup (called from the root layout) ─────────────────────────────────────────

/** How to present notifications while the app is in the foreground. */
export function setupNotificationHandler(): void {
  const N = getNotifications();
  if (!N) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/** Android notification channel (no-op elsewhere). */
export async function setupAndroidChannel(): Promise<void> {
  const N = getNotifications();
  if (!N || Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync('default', {
    name: 'Libre',
    importance: N.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

// ── Permissions ─────────────────────────────────────────────────────────────────

export async function requestPermissions(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  const { status } = await N.requestPermissionsAsync();
  return status === 'granted';
}

export async function getPermissionStatus(): Promise<boolean> {
  const N = getNotifications();
  if (!N) return false;
  const { status } = await N.getPermissionsAsync();
  return status === 'granted';
}

// ── Daily motivational ────────────────────────────────────────────────────────

export async function scheduleDailyMotivational(hour = 9, minute = 0): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  // Cancel previous daily notifications before rescheduling
  const scheduled = await N.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.identifier as string).startsWith(DAILY_ID)) {
      await N.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Pick a random message from the current language's quotes
  const messages = i18n.t('notifications.daily.messages', { returnObjects: true }) as string[];
  const body = messages[Math.floor(Math.random() * messages.length)];
  const title = i18n.t('notifications.daily.title');

  await N.scheduleNotificationAsync({
    identifier: `${DAILY_ID}-${Date.now()}`,
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

// ── Milestone notification ────────────────────────────────────────────────────

export async function scheduleMilestoneNotification(
  milestoneLabel: string,
  description: string,
  minutesFromNow: number
): Promise<void> {
  const N = getNotifications();
  if (!N || minutesFromNow <= 0) return;

  const title = i18n.t('notifications.milestone.title', { label: milestoneLabel });

  await N.scheduleNotificationAsync({
    identifier: `${MILESTONE_ID}-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    content: {
      title,
      body: description,
      sound: true,
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.round(minutesFromNow * 60),
      repeats: false,
    },
  });
}

// ── Craving pattern alert ─────────────────────────────────────────────────────

/** Schedule a "heads up" notification at the hour when the user most commonly has cravings */
export async function scheduleCravingAlert(mostCommonHour: number): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  // Cancel previous craving alerts
  const scheduled = await N.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.identifier as string).startsWith(CRAVING_ID)) {
      await N.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Schedule 15 min before the typical craving hour
  const alertMinute = 45;
  const alertHour = mostCommonHour === 0 ? 23 : mostCommonHour - 1;

  await N.scheduleNotificationAsync({
    identifier: `${CRAVING_ID}-${Date.now()}`,
    content: {
      title: i18n.t('notifications.craving.title'),
      body: i18n.t('notifications.craving.body'),
      sound: true,
    },
    trigger: {
      type: N.SchedulableTriggerInputTypes.DAILY,
      hour: alertHour,
      minute: alertMinute,
    },
  });
}

export async function cancelAll(): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
}

// ── Orchestrator ───────────────────────────────────────────────────────────────

/**
 * Syncs all notification types based on current profile/diary state:
 *  - daily motivational message
 *  - next 1-3 upcoming health/time milestones
 *  - craving-pattern alert, once enough diary data exists
 * Safe to call repeatedly (e.g. on app open, after a new diary entry, after
 * toggling the notifications switch) — milestone notifications are cancelled
 * and rescheduled each time to avoid duplicates piling up.
 */
export async function syncNotifications(profile: UserProfile, entries: CravingEntry[]): Promise<void> {
  const N = getNotifications();
  if (!N) return;
  const granted = await getPermissionStatus();
  if (!granted) return;

  await scheduleDailyMotivational(9, 0);

  // Cancel previously-scheduled milestone notifications before scheduling new ones
  const scheduled = await N.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.identifier as string).startsWith(MILESTONE_ID)) {
      await N.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Next 1-3 upcoming health/time milestones from streakStart (or quitDate)
  const baseDate = parseQuitDate(profile.streakStart ?? profile.quitDate);
  const elapsedMin = (Date.now() - baseDate.getTime()) / 60000;
  const upcoming = MILESTONE_DEFS
    .filter(m => m.thresholdMin > elapsedMin)
    .slice(0, 3);
  for (const m of upcoming) {
    const minutesFromNow = m.thresholdMin - elapsedMin;
    const label = i18n.t(`health.milestones.${m.id}.time`);
    const description = i18n.t(`health.milestones.${m.id}.description`);
    await scheduleMilestoneNotification(label, description, minutesFromNow);
  }

  // Craving-pattern alert if enough diary data
  if (entries.length >= 5) {
    const hourCounts = new Array(24).fill(0);
    entries.forEach(e => { hourCounts[new Date(e.timestamp).getHours()]++; });
    const mostCommonHour = hourCounts.indexOf(Math.max(...hourCounts));
    await scheduleCravingAlert(mostCommonHour);
  }
}
