export type AuthorizationStatus = 'authorized' | 'denied' | 'notDetermined';
export type AlarmActionType = 'dismiss' | 'snooze';
export interface AlarmActionEvent {
    alarmId: string;
    action: AlarmActionType;
    payload: string | null;
}
export interface LaunchPayload {
    alarmId: string;
    action: AlarmActionType;
    payload: string | null;
}
export interface SnoozeConfig {
    /** Snooze duration in seconds (default: 540 = 9 minutes) */
    durationSeconds?: number;
    /** Custom label for the snooze button (default: 'Snooze') */
    buttonLabel?: string;
    /** Hex color for the snooze button text (default: '#FFFFFF') */
    buttonColor?: string;
    /** Optional payload string passed back in the alarm action event when snoozed */
    payload?: string;
    /** Whether to launch the app when the snooze button is pressed. Defaults to false. */
    launchApp?: boolean;
}
export interface NativeScheduleAlarmOptions {
    id: string;
    epochSeconds: number;
    title: string;
    soundName?: string | null;
    launchAppOnDismiss?: boolean;
    dismissPayload?: string | null;
    stopButtonLabel?: string | null;
    stopButtonColor?: string | null;
    tintColor?: string | null;
    snooze?: SnoozeConfig | null;
}
export interface NativeScheduleRepeatingAlarmOptions {
    id: string;
    hour: number;
    minute: number;
    weekdays: number[];
    title: string;
    soundName?: string | null;
    launchAppOnDismiss?: boolean;
    dismissPayload?: string | null;
    stopButtonLabel?: string | null;
    stopButtonColor?: string | null;
    tintColor?: string | null;
    snooze?: SnoozeConfig | null;
}
interface ExpoAlarmKitModuleType {
    /**
     * Check if AlarmKit is available on this device (iOS 26+).
     * @returns True if AlarmKit is available.
     */
    isAvailable(): boolean;
    /**
     * Configure the module with an App Group identifier.
     * This MUST be called before any other methods.
     * @param appGroupIdentifier - The App Group identifier (e.g., "group.com.yourapp.alarms")
     * @returns True if configuration succeeded.
     */
    configure(appGroupIdentifier: string): boolean;
    /**
     * Request authorization to schedule alarms.
     * @returns The current authorization status after the request.
     */
    requestAuthorization(): Promise<AuthorizationStatus>;
    /**
     * Generate a valid UUID string for use as an alarm ID.
     * @returns A new UUID string.
     */
    generateUUID(): string;
    /**
     * Schedule a one-time alarm.
     * @param options - Alarm configuration options.
     * @returns True if scheduling succeeded.
     */
    scheduleAlarm(options: NativeScheduleAlarmOptions): Promise<boolean>;
    /**
     * Schedule a weekly repeating alarm.
     * @param options - Alarm configuration options.
     * @returns True if scheduling succeeded.
     */
    scheduleRepeatingAlarm(options: NativeScheduleRepeatingAlarmOptions): Promise<boolean>;
    /**
     * Cancel a scheduled alarm.
     * @param id - The alarm ID to cancel.
     * @returns True if cancellation succeeded.
     */
    cancelAlarm(id: string): Promise<boolean>;
    /**
     * Get all currently scheduled alarm IDs.
     * @returns Array of alarm IDs stored in UserDefaults.
     */
    getAllAlarms(): string[];
    /**
     * Remove an alarm from UserDefaults (does not cancel the native alarm).
     * @param id - The alarm ID to remove.
     */
    removeAlarm(id: string): void;
    /**
     * Clear all alarms from UserDefaults (does not cancel the native alarms).
     * This resets the list of alarm IDs stored in UserDefaults.
     */
    clearAllAlarms(): void;
    /**
     * Get the launch payload if the app was opened from an alarm dismiss/snooze intent.
     * The payload is cleared after retrieval.
     * @returns The launch payload or null if not launched from an alarm.
     */
    getLaunchPayload(): LaunchPayload | null;
    /**
     * Check for and emit any pending alarm action event.
     * Call this on app foreground to catch events that occurred while the app was backgrounded.
     */
    checkPendingEvent(): void;
}
declare const _default: ExpoAlarmKitModuleType;
export default _default;
//# sourceMappingURL=ExpoAlarmKitModule.d.ts.map