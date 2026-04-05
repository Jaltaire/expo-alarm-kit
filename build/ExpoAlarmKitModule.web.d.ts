import { NativeModule } from 'expo';
export type AuthorizationStatus = 'authorized' | 'denied' | 'notDetermined';
export interface LaunchPayload {
    alarmId: string;
    payload: string | null;
}
export interface ScheduleAlarmOptions {
    id: string;
    epochSeconds: number;
    title: string;
    soundName?: string | null;
    launchAppOnDismiss?: boolean;
    doSnoozeIntent?: boolean;
    launchAppOnSnooze?: boolean;
    dismissPayload?: string | null;
    snoozePayload?: string | null;
    stopButtonLabel?: string | null;
    snoozeButtonLabel?: string | null;
    stopButtonColor?: string | null;
    snoozeButtonColor?: string | null;
    tintColor?: string | null;
    snoozeDuration?: number | null;
}
export interface ScheduleRepeatingAlarmOptions {
    id: string;
    hour: number;
    minute: number;
    weekdays: number[];
    title: string;
    soundName?: string | null;
    launchAppOnDismiss?: boolean;
    doSnoozeIntent?: boolean;
    launchAppOnSnooze?: boolean;
    dismissPayload?: string | null;
    snoozePayload?: string | null;
    stopButtonLabel?: string | null;
    snoozeButtonLabel?: string | null;
    stopButtonColor?: string | null;
    snoozeButtonColor?: string | null;
    tintColor?: string | null;
    snoozeDuration?: number | null;
}
declare class ExpoAlarmKitModule extends NativeModule {
    configure(appGroupIdentifier: string): boolean;
    requestAuthorization(): Promise<AuthorizationStatus>;
    generateUUID(): string;
    scheduleAlarm(options: ScheduleAlarmOptions): Promise<boolean>;
    scheduleRepeatingAlarm(options: ScheduleRepeatingAlarmOptions): Promise<boolean>;
    cancelAlarm(id: string): Promise<boolean>;
    getAllAlarms(): string[];
    removeAlarm(id: string): void;
    clearAllAlarms(): void;
    getLaunchPayload(): LaunchPayload | null;
}
declare const _default: typeof ExpoAlarmKitModule;
export default _default;
//# sourceMappingURL=ExpoAlarmKitModule.web.d.ts.map