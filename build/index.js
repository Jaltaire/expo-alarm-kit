import ExpoAlarmKitModule from './ExpoAlarmKitModule';
/**
 * Check if AlarmKit is available on this device (iOS 26+).
 * Returns false on older iOS versions and on Android.
 */
export function isAvailable() {
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
export function configure(appGroupIdentifier) {
    return ExpoAlarmKitModule.configure(appGroupIdentifier);
}
/**
 * Request authorization to schedule alarms.
 * On first call, this will prompt the user for permission.
 * @returns The current authorization status.
 */
export async function requestAuthorization() {
    return ExpoAlarmKitModule.requestAuthorization();
}
/**
 * Generate a valid UUID string for use as an alarm ID.
 * Call this before scheduling an alarm to get a unique identifier.
 * @returns A new UUID string.
 */
export function generateUUID() {
    return ExpoAlarmKitModule.generateUUID();
}
/**
 * Schedule a one-time alarm.
 * @param options - Alarm configuration options. Provide either epochSeconds or date.
 * @returns True if the alarm was scheduled successfully.
 */
export async function scheduleAlarm(options) {
    // Convert Date to epochSeconds if provided
    let epochSeconds;
    if (options.date !== undefined && options.epochSeconds !== undefined) {
        throw new Error('Provide either epochSeconds or date, not both');
    }
    if (options.date !== undefined) {
        epochSeconds = Math.floor(options.date.getTime() / 1000);
    }
    else if (options.epochSeconds !== undefined) {
        epochSeconds = options.epochSeconds;
    }
    else {
        throw new Error('Must provide either epochSeconds or date');
    }
    // Pass to native module with epochSeconds
    return ExpoAlarmKitModule.scheduleAlarm({
        ...options,
        epochSeconds,
    });
}
/**
 * Schedule a weekly repeating alarm.
 * @param options - Alarm configuration options.
 * @returns True if the alarm was scheduled successfully.
 */
export async function scheduleRepeatingAlarm(options) {
    return ExpoAlarmKitModule.scheduleRepeatingAlarm(options);
}
/**
 * Cancel a scheduled alarm.
 * This removes the alarm from both AlarmKit and App Group storage.
 * @param id - The alarm ID to cancel.
 * @returns True if the alarm was cancelled successfully.
 */
export async function cancelAlarm(id) {
    return ExpoAlarmKitModule.cancelAlarm(id);
}
/**
 * Get all currently scheduled alarm IDs.
 * @returns Array of alarm IDs.
 */
export function getAllAlarms() {
    return ExpoAlarmKitModule.getAllAlarms();
}
export function clearAllAlarms() {
    ExpoAlarmKitModule.clearAllAlarms();
}
/**
 * Remove an alarm from App Group storage.
 * Note: This does NOT cancel the native alarm. Use cancelAlarm() to fully cancel an alarm.
 * @param id - The alarm ID to remove from storage.
 */
export function removeAlarm(id) {
    ExpoAlarmKitModule.removeAlarm(id);
}
/**
 * Get the launch payload if the app was opened from an alarm dismiss/snooze intent.
 * The payload contains the alarmId and payload string (or null if not provided).
 * Note: The payload is cleared after retrieval, so subsequent calls will return null.
 * @returns The launch payload or null if not launched from an alarm.
 */
export function getLaunchPayload() {
    return ExpoAlarmKitModule.getLaunchPayload();
}
// Default export object for namespace-style usage
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
};
export default ExpoAlarmKit;
//# sourceMappingURL=index.js.map