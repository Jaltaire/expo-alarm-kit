import { EventEmitter, type EventSubscription } from 'expo-modules-core';
import ExpoAlarmKitModule, {
  AuthorizationStatus,
  AlarmActionType,
  AlarmActionEvent,
  LaunchPayload,
  SnoozeConfig,
} from './ExpoAlarmKitModule';

export { AuthorizationStatus, AlarmActionType, AlarmActionEvent, LaunchPayload, SnoozeConfig };

type AlarmEvents = {
  onAlarmAction: (event: AlarmActionEvent) => void;
};

const emitter = new EventEmitter<AlarmEvents>(ExpoAlarmKitModule as any);

/**
 * Check if AlarmKit is available on this device (iOS 26+).
 * Returns false on older iOS versions and on Android.
 */
export function isAvailable(): boolean {
  return ExpoAlarmKitModule.isAvailable();
}

/**
 * Configure the module with an App Group identifier.
 * This MUST be called before any other methods to enable shared storage
 * between your app and the alarm dismiss intent.
 *
 * @param appGroupIdentifier - The App Group identifier (e.g., "group.com.yourapp.alarms")
 * @returns True if configuration succeeded.
 *
 * @example
 * ```typescript
 * import { configure } from 'expo-alarm-kit';
 *
 * // Call this early in your app initialization
 * const success = configure('group.com.yourcompany.yourapp');
 * if (!success) {
 *   console.error('Failed to configure ExpoAlarmKit');
 * }
 * ```
 */
export function configure(appGroupIdentifier: string): boolean {
  return ExpoAlarmKitModule.configure(appGroupIdentifier);
}

/**
 * Request authorization to schedule alarms.
 * On first call, this will prompt the user for permission.
 * @returns The current authorization status.
 */
export async function requestAuthorization(): Promise<AuthorizationStatus> {
  return ExpoAlarmKitModule.requestAuthorization();
}

/**
 * Generate a valid UUID string for use as an alarm ID.
 * Call this before scheduling an alarm to get a unique identifier.
 * @returns A new UUID string.
 */
export function generateUUID(): string {
  return ExpoAlarmKitModule.generateUUID();
}

export interface ScheduleAlarmOptions {
  /** Unique identifier for the alarm */
  id: string;
  /** Unix timestamp in seconds for when the alarm should fire. Provide either this or date. */
  epochSeconds?: number;
  /** JavaScript Date object for when the alarm should fire. Provide either this or epochSeconds. */
  date?: Date;
  /** Title displayed for the alarm */
  title: string;
  /** Optional custom sound name (must exist in app bundle) */
  soundName?: string;
  /** Whether to launch the app when the alarm stop button is pressed. Defaults to false. */
  launchAppOnDismiss?: boolean;
  /** Optional payload string passed back in the alarm action event when dismissed. Defaults to null. */
  dismissPayload?: string;
  /** Custom label for the stop button (default: 'Stop') */
  stopButtonLabel?: string;
  /** Hex color for the stop button text (default: '#FFFFFF') */
  stopButtonColor?: string;
  /** Hex color for the overall alarm tint (default: '#0000FF') */
  tintColor?: string;
  /**
   * Snooze configuration. If provided, a snooze button is shown on the alarm.
   * If omitted, no snooze button is displayed.
   */
  snooze?: SnoozeConfig;
}

/**
 * Schedule a one-time alarm.
 * @param options - Alarm configuration options. Provide either epochSeconds or date.
 * @returns True if the alarm was scheduled successfully.
 */
export async function scheduleAlarm(options: ScheduleAlarmOptions): Promise<boolean> {
  let epochSeconds: number;

  if (options.date !== undefined && options.epochSeconds !== undefined) {
    throw new Error('Provide either epochSeconds or date, not both');
  }

  if (options.date !== undefined) {
    epochSeconds = Math.floor(options.date.getTime() / 1000);
  } else if (options.epochSeconds !== undefined) {
    epochSeconds = options.epochSeconds;
  } else {
    throw new Error('Must provide either epochSeconds or date');
  }

  return ExpoAlarmKitModule.scheduleAlarm({
    ...options,
    epochSeconds,
    snooze: options.snooze ?? null,
  });
}

export interface ScheduleRepeatingAlarmOptions {
  /** Unique identifier for the alarm */
  id: string;
  /** Hour (0-23) for the alarm */
  hour: number;
  /** Minute (0-59) for the alarm */
  minute: number;
  /** Array of weekday numbers: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday */
  weekdays: number[];
  /** Title displayed for the alarm */
  title: string;
  /** Optional custom sound name (must exist in app bundle) */
  soundName?: string;
  /** Whether to launch the app when the alarm stop button is pressed. Defaults to false. */
  launchAppOnDismiss?: boolean;
  /** Optional payload string passed back in the alarm action event when dismissed. Defaults to null. */
  dismissPayload?: string;
  /** Custom label for the stop button (default: 'Stop') */
  stopButtonLabel?: string;
  /** Hex color for the stop button text (default: '#FFFFFF') */
  stopButtonColor?: string;
  /** Hex color for the overall alarm tint (default: '#0000FF') */
  tintColor?: string;
  /**
   * Snooze configuration. If provided, a snooze button is shown on the alarm.
   * If omitted, no snooze button is displayed.
   */
  snooze?: SnoozeConfig;
}

/**
 * Schedule a weekly repeating alarm.
 * @param options - Alarm configuration options.
 * @returns True if the alarm was scheduled successfully.
 */
export async function scheduleRepeatingAlarm(options: ScheduleRepeatingAlarmOptions): Promise<boolean> {
  return ExpoAlarmKitModule.scheduleRepeatingAlarm({
    ...options,
    snooze: options.snooze ?? null,
  });
}

/**
 * Cancel a scheduled alarm.
 * This removes the alarm from both AlarmKit and App Group storage.
 * @param id - The alarm ID to cancel.
 * @returns True if the alarm was cancelled successfully.
 */
export async function cancelAlarm(id: string): Promise<boolean> {
  return ExpoAlarmKitModule.cancelAlarm(id);
}

/**
 * Get all currently scheduled alarm IDs.
 * @returns Array of alarm IDs.
 */
export function getAllAlarms(): string[] {
  return ExpoAlarmKitModule.getAllAlarms();
}

/**
 * Clear all alarms from App Group storage (does not cancel native alarms).
 */
export function clearAllAlarms(): void {
  ExpoAlarmKitModule.clearAllAlarms();
}

/**
 * Remove an alarm from App Group storage.
 * Note: This does NOT cancel the native alarm. Use cancelAlarm() to fully cancel an alarm.
 * @param id - The alarm ID to remove from storage.
 */
export function removeAlarm(id: string): void {
  ExpoAlarmKitModule.removeAlarm(id);
}

/**
 * Get the launch payload if the app was opened from an alarm dismiss/snooze action.
 * The payload includes an `action` field ("dismiss" or "snooze") to distinguish the trigger.
 * Note: The payload is cleared after retrieval, so subsequent calls will return null.
 * @returns The launch payload or null if not launched from an alarm.
 */
export function getLaunchPayload(): LaunchPayload | null {
  return ExpoAlarmKitModule.getLaunchPayload();
}

/**
 * Check for and emit any pending alarm action event.
 * Call this on app foreground to catch events that occurred while the app was backgrounded.
 */
export function checkPendingEvent(): void {
  ExpoAlarmKitModule.checkPendingEvent();
}

/**
 * Add a listener for alarm action events (dismiss or snooze).
 * The listener receives an AlarmActionEvent with the alarm ID, action type, and optional payload.
 *
 * @example
 * ```typescript
 * const subscription = ExpoAlarmKit.addAlarmActionListener((event) => {
 *   if (event.action === 'snooze') {
 *     // Reset timer countdown
 *   } else if (event.action === 'dismiss') {
 *     // Clear timer
 *   }
 * });
 *
 * // Clean up when done
 * subscription.remove();
 * ```
 */
export function addAlarmActionListener(
  listener: (event: AlarmActionEvent) => void,
): EventSubscription {
  return emitter.addListener('onAlarmAction', listener);
}

const ExpoAlarmKit = {
  isAvailable,
  configure,
  requestAuthorization,
  generateUUID,
  scheduleAlarm,
  scheduleRepeatingAlarm,
  cancelAlarm,
  getAllAlarms,
  clearAllAlarms,
  removeAlarm,
  getLaunchPayload,
  checkPendingEvent,
  addAlarmActionListener,
};

export default ExpoAlarmKit;
