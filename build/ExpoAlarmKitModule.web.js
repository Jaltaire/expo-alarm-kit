import { registerWebModule, NativeModule } from 'expo';
class ExpoAlarmKitModule extends NativeModule {
    configure(appGroupIdentifier) {
        console.warn('ExpoAlarmKit.configure is not supported on web');
        return false;
    }
    async requestAuthorization() {
        console.warn('ExpoAlarmKit.requestAuthorization is not supported on web');
        return 'notDetermined';
    }
    generateUUID() {
        // Simple UUID v4 implementation for web
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    async scheduleAlarm(options) {
        console.warn('ExpoAlarmKit.scheduleAlarm is not supported on web');
        return false;
    }
    async scheduleRepeatingAlarm(options) {
        console.warn('ExpoAlarmKit.scheduleRepeatingAlarm is not supported on web');
        return false;
    }
    async cancelAlarm(id) {
        console.warn('ExpoAlarmKit.cancelAlarm is not supported on web');
        return false;
    }
    getAllAlarms() {
        console.warn('ExpoAlarmKit.getAllAlarms is not supported on web');
        return [];
    }
    removeAlarm(id) {
        console.warn('ExpoAlarmKit.removeAlarm is not supported on web');
    }
    clearAllAlarms() {
        console.warn('ExpoAlarmKit.clearAllAlarms is not supported on web');
    }
    getLaunchPayload() {
        console.warn('ExpoAlarmKit.getLaunchPayload is not supported on web');
        return null;
    }
}
export default registerWebModule(ExpoAlarmKitModule, 'ExpoAlarmKitModule');
//# sourceMappingURL=ExpoAlarmKitModule.web.js.map