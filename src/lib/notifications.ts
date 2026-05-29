import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '@/src/i18n';

const DAILY_ID = 'libre-daily-motivational';
const CRAVING_ID = 'libre-craving-alert';

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getPermissionStatus(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// ── Daily motivational ────────────────────────────────────────────────────────

export async function scheduleDailyMotivational(hour = 9, minute = 0): Promise<void> {
  if (Platform.OS === 'web') return;
  // Cancel previous daily notifications before rescheduling
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.identifier as string).startsWith(DAILY_ID)) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Pick a random message from the current language's quotes
  const messages = i18n.t('notifications.daily.messages', { returnObjects: true }) as string[];
  const body = messages[Math.floor(Math.random() * messages.length)];
  const title = i18n.t('notifications.daily.title');

  await Notifications.scheduleNotificationAsync({
    identifier: `${DAILY_ID}-${Date.now()}`,
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
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
  if (Platform.OS === 'web' || minutesFromNow <= 0) return;

  const title = i18n.t('notifications.milestone.title', { label: milestoneLabel });

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: description,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.round(minutesFromNow * 60),
      repeats: false,
    },
  });
}

// ── Craving pattern alert ─────────────────────────────────────────────────────

/** Schedule a "heads up" notification at the hour when the user most commonly has cravings */
export async function scheduleCravingAlert(mostCommonHour: number): Promise<void> {
  if (Platform.OS === 'web') return;
  // Cancel previous craving alerts
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if ((n.identifier as string).startsWith(CRAVING_ID)) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  // Schedule 15 min before the typical craving hour
  const alertMinute = 45;
  const alertHour = mostCommonHour === 0 ? 23 : mostCommonHour - 1;

  await Notifications.scheduleNotificationAsync({
    identifier: `${CRAVING_ID}-${Date.now()}`,
    content: {
      title: i18n.t('notifications.craving.title'),
      body: i18n.t('notifications.craving.body'),
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: alertHour,
      minute: alertMinute,
    },
  });
}

export async function cancelAll(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
