import ExpoModulesCore

#if canImport(AlarmKit)
import AlarmKit
import ActivityKit
import AppIntents
import SwiftUI
#endif

// MARK: - Storage Keys
private let alarmKeyPrefix = "ExpoAlarmKit.alarm:"
private let launchAppKeyPrefix = "ExpoAlarmKit.launchApp:"

// MARK: - App Group Storage Manager
public class ExpoAlarmKitStorage {
    public static var appGroupIdentifier: String? = nil

    public static var sharedDefaults: UserDefaults? {
        guard let groupId = appGroupIdentifier else {
            print("[ExpoAlarmKit] Warning: App Group not configured. Call configure() first.")
            return nil
        }
        return UserDefaults(suiteName: groupId)
    }

    public static func setAlarm(id: String, value: Double) {
        sharedDefaults?.set(value, forKey: alarmKeyPrefix + id)
    }

    public static func removeAlarm(id: String) {
        sharedDefaults?.removeObject(forKey: alarmKeyPrefix + id)
    }

    public static func getAllAlarmIds() -> [String] {
        guard let defaults = sharedDefaults?.dictionaryRepresentation() else { return [] }
        var alarmIds: [String] = []
        for key in defaults.keys {
            if key.hasPrefix(alarmKeyPrefix) {
                let alarmId = String(key.dropFirst(alarmKeyPrefix.count))
                alarmIds.append(alarmId)
            }
        }
        return alarmIds
    }

    public static func clearAllAlarms() {
        guard let defaults = sharedDefaults?.dictionaryRepresentation() else { return }
        for key in defaults.keys {
            if key.hasPrefix(alarmKeyPrefix) {
                sharedDefaults?.removeObject(forKey: key)
            }
        }
    }

    public static func setLaunchAppOnDismiss(alarmId: String, value: Bool) {
        sharedDefaults?.set(value, forKey: launchAppKeyPrefix + alarmId)
    }

    public static func getLaunchAppOnDismiss(alarmId: String) -> Bool {
        return sharedDefaults?.bool(forKey: launchAppKeyPrefix + alarmId) ?? false
    }

    public static func removeLaunchAppOnDismiss(alarmId: String) {
        sharedDefaults?.removeObject(forKey: launchAppKeyPrefix + alarmId)
    }
}

// MARK: - Helper Functions
#if canImport(AlarmKit)
@available(iOS 26.0, *)
private func colorFromHex(_ hex: String) -> Color {
    var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
    hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

    var rgb: UInt64 = 0
    Scanner(string: hexSanitized).scanHexInt64(&rgb)

    let r = Double((rgb & 0xFF0000) >> 16) / 255.0
    let g = Double((rgb & 0x00FF00) >> 8) / 255.0
    let b = Double(rgb & 0x0000FF) / 255.0

    return Color(red: r, green: g, blue: b)
}
#endif

private func buildLaunchPayload(alarmId: String, payload: String?) -> [String: Any] {
    return [
        "alarmId": alarmId,
        "payload": payload ?? NSNull()
    ]
}

// MARK: - Record Structs for Expo Module
#if canImport(AlarmKit)
@available(iOS 26.0, *)
struct ScheduleAlarmOptions: Record {
    @Field var id: String
    @Field var epochSeconds: Double
    @Field var title: String
    @Field var soundName: String?
    @Field var launchAppOnDismiss: Bool?
    @Field var doSnoozeIntent: Bool?
    @Field var launchAppOnSnooze: Bool?
    @Field var dismissPayload: String?
    @Field var snoozePayload: String?
    @Field var stopButtonLabel: String?
    @Field var snoozeButtonLabel: String?
    @Field var stopButtonColor: String?
    @Field var snoozeButtonColor: String?
    @Field var tintColor: String?
    @Field var snoozeDuration: Int?
}

@available(iOS 26.0, *)
struct ScheduleRepeatingAlarmOptions: Record {
    @Field var id: String
    @Field var hour: Int
    @Field var minute: Int
    @Field var weekdays: [Int]
    @Field var title: String
    @Field var soundName: String?
    @Field var launchAppOnDismiss: Bool?
    @Field var doSnoozeIntent: Bool?
    @Field var launchAppOnSnooze: Bool?
    @Field var dismissPayload: String?
    @Field var snoozePayload: String?
    @Field var stopButtonLabel: String?
    @Field var snoozeButtonLabel: String?
    @Field var stopButtonColor: String?
    @Field var snoozeButtonColor: String?
    @Field var tintColor: String?
    @Field var snoozeDuration: Int?
}

// MARK: - App Intents (iOS 26+)
@available(iOS 26.0, *)
public struct AlarmDismissIntent: LiveActivityIntent {
    public static var title: LocalizedStringResource = "Dismiss Alarm"
    public static var description = IntentDescription("Handles alarm dismissal")
    public static var openAppWhenRun: Bool = false

    @Parameter(title: "alarmId")
    public var alarmId: String

    @Parameter(title: "payload")
    public var payload: String?

    public init() {}

    public init(alarmId: String, payload: String? = nil) {
        self.alarmId = alarmId
        self.payload = payload
    }

    public func perform() async throws -> some IntentResult {
        ExpoAlarmKitModule.launchPayload = buildLaunchPayload(alarmId: self.alarmId, payload: self.payload)
        ExpoAlarmKitStorage.removeAlarm(id: self.alarmId)
        ExpoAlarmKitStorage.removeLaunchAppOnDismiss(alarmId: self.alarmId)
        return .result()
    }
}

@available(iOS 26.0, *)
public struct AlarmDismissIntentWithLaunch: LiveActivityIntent {
    public static var title: LocalizedStringResource = "Dismiss Alarm"
    public static var description = IntentDescription("Handles alarm dismissal and opens app")
    public static var openAppWhenRun: Bool = true

    @Parameter(title: "alarmId")
    public var alarmId: String

    @Parameter(title: "payload")
    public var payload: String?

    public init() {}

    public init(alarmId: String, payload: String? = nil) {
        self.alarmId = alarmId
        self.payload = payload
    }

    public func perform() async throws -> some IntentResult {
        ExpoAlarmKitModule.launchPayload = buildLaunchPayload(alarmId: self.alarmId, payload: self.payload)
        ExpoAlarmKitStorage.removeAlarm(id: self.alarmId)
        ExpoAlarmKitStorage.removeLaunchAppOnDismiss(alarmId: self.alarmId)
        return .result()
    }
}

@available(iOS 26.0, *)
public struct AlarmSnoozeIntent: LiveActivityIntent {
    public static var title: LocalizedStringResource = "Snooze Alarm"
    public static var description = IntentDescription("Handles alarm snooze")
    public static var openAppWhenRun: Bool = false

    @Parameter(title: "alarmId")
    public var alarmId: String

    @Parameter(title: "payload")
    public var payload: String?

    public init() {}

    public init(alarmId: String, payload: String? = nil) {
        self.alarmId = alarmId
        self.payload = payload
    }

    public func perform() async throws -> some IntentResult {
        ExpoAlarmKitModule.launchPayload = buildLaunchPayload(alarmId: self.alarmId, payload: self.payload)
        return .result()
    }
}

@available(iOS 26.0, *)
public struct AlarmSnoozeIntentWithLaunch: LiveActivityIntent {
    public static var title: LocalizedStringResource = "Snooze Alarm"
    public static var description = IntentDescription("Handles alarm snooze and opens app")
    public static var openAppWhenRun: Bool = true

    @Parameter(title: "alarmId")
    public var alarmId: String

    @Parameter(title: "payload")
    public var payload: String?

    public init() {}

    public init(alarmId: String, payload: String? = nil) {
        self.alarmId = alarmId
        self.payload = payload
    }

    public func perform() async throws -> some IntentResult {
        ExpoAlarmKitModule.launchPayload = buildLaunchPayload(alarmId: self.alarmId, payload: self.payload)
        return .result()
    }
}
#endif

// MARK: - Expo Module
public class ExpoAlarmKitModule: Module {
    public static var launchPayload: [String: Any]? = nil

    public func definition() -> ModuleDefinition {
        Name("ExpoAlarmKit")

        // MARK: - Check Availability
        Function("isAvailable") { () -> Bool in
            #if canImport(AlarmKit)
            if #available(iOS 26.0, *) {
                return true
            }
            #endif
            return false
        }

        // MARK: - Configure App Group
        Function("configure") { (appGroupIdentifier: String) -> Bool in
            ExpoAlarmKitStorage.appGroupIdentifier = appGroupIdentifier
            if ExpoAlarmKitStorage.sharedDefaults != nil {
                print("[ExpoAlarmKit] Configured with App Group: \(appGroupIdentifier)")
                return true
            } else {
                print("[ExpoAlarmKit] Failed to configure App Group: \(appGroupIdentifier)")
                return false
            }
        }

        // MARK: - Request Authorization
        AsyncFunction("requestAuthorization") { () -> String in
            #if canImport(AlarmKit)
            if #available(iOS 26.0, *) {
                let status = AlarmManager.shared.authorizationState
                switch status {
                case .authorized:
                    return "authorized"
                case .denied, .notDetermined:
                    do {
                        let newStatus = try await AlarmManager.shared.requestAuthorization()
                        switch newStatus {
                        case .authorized:
                            return "authorized"
                        case .denied:
                            return "denied"
                        case .notDetermined:
                            return "notDetermined"
                        @unknown default:
                            return "notDetermined"
                        }
                    } catch {
                        return "denied"
                    }
                @unknown default:
                    return "notDetermined"
                }
            }
            #endif
            return "notDetermined"
        }

        // MARK: - Generate UUID
        Function("generateUUID") { () -> String in
            return UUID().uuidString
        }

        // MARK: - Schedule One-Time Alarm
        AsyncFunction("scheduleAlarm") { (options: [String: Any]) async throws -> Bool in
            #if canImport(AlarmKit)
            if #available(iOS 26.0, *) {
                return await self.scheduleAlarmImpl(options: options)
            }
            #endif
            print("[ExpoAlarmKit] AlarmKit not available on this iOS version")
            return false
        }

        // MARK: - Schedule Repeating Alarm
        AsyncFunction("scheduleRepeatingAlarm") { (options: [String: Any]) async throws -> Bool in
            #if canImport(AlarmKit)
            if #available(iOS 26.0, *) {
                return await self.scheduleRepeatingAlarmImpl(options: options)
            }
            #endif
            print("[ExpoAlarmKit] AlarmKit not available on this iOS version")
            return false
        }

        // MARK: - Cancel Alarm
        AsyncFunction("cancelAlarm") { (id: String) -> Bool in
            #if canImport(AlarmKit)
            if #available(iOS 26.0, *) {
                guard let uuid = UUID(uuidString: id) else {
                    print("[ExpoAlarmKit] Invalid UUID string: \(id)")
                    return false
                }
                do {
                    try AlarmManager.shared.cancel(id: uuid)
                    ExpoAlarmKitStorage.removeAlarm(id: id)
                    ExpoAlarmKitStorage.removeLaunchAppOnDismiss(alarmId: id)
                    return true
                } catch {
                    print("[ExpoAlarmKit] Failed to cancel alarm: \(error)")
                    return false
                }
            }
            #endif
            return false
        }

        // MARK: - Get All Alarms
        Function("getAllAlarms") { () -> [String] in
            return ExpoAlarmKitStorage.getAllAlarmIds()
        }

        // MARK: - Remove Alarm (from App Group storage only)
        Function("removeAlarm") { (id: String) in
            ExpoAlarmKitStorage.removeAlarm(id: id)
            ExpoAlarmKitStorage.removeLaunchAppOnDismiss(alarmId: id)
        }

        // MARK: - Clear All Alarms (from App Group storage only)
        Function("clearAllAlarms") { () in
            ExpoAlarmKitStorage.clearAllAlarms()
        }

        // MARK: - Get Launch Payload
        Function("getLaunchPayload") { () -> [String: Any]? in
            let payload = ExpoAlarmKitModule.launchPayload
            ExpoAlarmKitModule.launchPayload = nil
            return payload
        }
    }

    // MARK: - AlarmKit Implementation (iOS 26+)

    #if canImport(AlarmKit)
    @available(iOS 26.0, *)
    private func scheduleAlarmImpl(options: [String: Any]) async -> Bool {
        struct Meta: AlarmMetadata {}

        guard let id = options["id"] as? String,
              let epochSeconds = options["epochSeconds"] as? Double,
              let title = options["title"] as? String,
              let uuid = UUID(uuidString: id) else {
            print("[ExpoAlarmKit] Missing required options or invalid UUID")
            return false
        }

        let date = Date(timeIntervalSince1970: epochSeconds)
        let launchAppOnDismiss = options["launchAppOnDismiss"] as? Bool ?? false
        let doSnoozeIntent = options["doSnoozeIntent"] as? Bool ?? false
        let launchAppOnSnooze = options["launchAppOnSnooze"] as? Bool ?? false
        let soundName = options["soundName"] as? String
        let dismissPayload = options["dismissPayload"] as? String
        let snoozePayload = options["snoozePayload"] as? String
        let stopButtonLabel = options["stopButtonLabel"] as? String ?? "Stop"
        let snoozeButtonLabel = options["snoozeButtonLabel"] as? String ?? "Snooze"
        let stopButtonColor = options["stopButtonColor"] as? String
        let snoozeButtonColor = options["snoozeButtonColor"] as? String
        let tintColorHex = options["tintColor"] as? String
        let snoozeDuration = options["snoozeDuration"] as? Int ?? (9 * 60)

        let stopColor = stopButtonColor != nil ? colorFromHex(stopButtonColor!) : Color.white
        let stopButton = AlarmButton(
            text: LocalizedStringResource(stringLiteral: stopButtonLabel),
            textColor: stopColor,
            systemImageName: "stop.circle"
        )

        let snoozeColor = snoozeButtonColor != nil ? colorFromHex(snoozeButtonColor!) : Color.white
        let snoozeButton = AlarmButton(
            text: LocalizedStringResource(stringLiteral: snoozeButtonLabel),
            textColor: snoozeColor,
            systemImageName: "clock.badge.checkmark"
        )

        let alertPresentation = AlarmPresentation.Alert(
            title: LocalizedStringResource(stringLiteral: title),
            stopButton: stopButton,
            secondaryButton: snoozeButton,
            secondaryButtonBehavior: .countdown
        )

        let presentation = AlarmPresentation(alert: alertPresentation)
        let countdownDuration = Alarm.CountdownDuration(preAlert: nil, postAlert: TimeInterval(snoozeDuration))
        let alarmTintColor = tintColorHex != nil ? colorFromHex(tintColorHex!) : Color.blue
        let attributes = AlarmAttributes<Meta>(presentation: presentation, metadata: Meta(), tintColor: alarmTintColor)

        let alarmSound: AlertConfiguration.AlertSound
        if let soundName = soundName, !soundName.isEmpty {
            alarmSound = .named(soundName)
        } else {
            alarmSound = .default
        }

        let stopIntent: any LiveActivityIntent = launchAppOnDismiss
            ? AlarmDismissIntentWithLaunch(alarmId: id, payload: dismissPayload)
            : AlarmDismissIntent(alarmId: id, payload: dismissPayload)

        let secondaryIntent: (any LiveActivityIntent)?
        if doSnoozeIntent {
            secondaryIntent = launchAppOnSnooze
                ? AlarmSnoozeIntentWithLaunch(alarmId: id, payload: snoozePayload)
                : AlarmSnoozeIntent(alarmId: id, payload: snoozePayload)
        } else {
            secondaryIntent = nil
        }

        let config = AlarmManager.AlarmConfiguration<Meta>(
            countdownDuration: countdownDuration,
            schedule: .fixed(date),
            attributes: attributes,
            stopIntent: stopIntent,
            secondaryIntent: secondaryIntent,
            sound: alarmSound
        )

        do {
            try await AlarmManager.shared.schedule(id: uuid, configuration: config)
            ExpoAlarmKitStorage.setAlarm(id: id, value: epochSeconds)
            return true
        } catch {
            print("[ExpoAlarmKit] Failed to schedule alarm: \(error)")
            return false
        }
    }

    @available(iOS 26.0, *)
    private func scheduleRepeatingAlarmImpl(options: [String: Any]) async -> Bool {
        struct Meta: AlarmMetadata {}

        guard let id = options["id"] as? String,
              let hour = options["hour"] as? Int,
              let minute = options["minute"] as? Int,
              let weekdaysRaw = options["weekdays"] as? [Int],
              let title = options["title"] as? String,
              let uuid = UUID(uuidString: id) else {
            print("[ExpoAlarmKit] Missing required options or invalid UUID")
            return false
        }

        let launchAppOnDismiss = options["launchAppOnDismiss"] as? Bool ?? false
        let doSnoozeIntent = options["doSnoozeIntent"] as? Bool ?? false
        let launchAppOnSnooze = options["launchAppOnSnooze"] as? Bool ?? false
        let soundName = options["soundName"] as? String
        let dismissPayload = options["dismissPayload"] as? String
        let snoozePayload = options["snoozePayload"] as? String
        let stopButtonLabel = options["stopButtonLabel"] as? String ?? "Stop"
        let snoozeButtonLabel = options["snoozeButtonLabel"] as? String ?? "Snooze"
        let stopButtonColor = options["stopButtonColor"] as? String
        let snoozeButtonColor = options["snoozeButtonColor"] as? String
        let tintColorHex = options["tintColor"] as? String
        let snoozeDuration = options["snoozeDuration"] as? Int ?? (9 * 60)

        let weekdayArray: [Locale.Weekday] = Array(Set(weekdaysRaw.compactMap { day -> Locale.Weekday? in
            switch day {
            case 1: return .sunday
            case 2: return .monday
            case 3: return .tuesday
            case 4: return .wednesday
            case 5: return .thursday
            case 6: return .friday
            case 7: return .saturday
            default: return nil
            }
        }))

        let time = Alarm.Schedule.Relative.Time(hour: hour, minute: minute)
        let recurrence = Alarm.Schedule.Relative.Recurrence.weekly(weekdayArray)
        let schedule = Alarm.Schedule.relative(Alarm.Schedule.Relative(time: time, repeats: recurrence))

        let stopColor = stopButtonColor != nil ? colorFromHex(stopButtonColor!) : Color.white
        let stopButton = AlarmButton(
            text: LocalizedStringResource(stringLiteral: stopButtonLabel),
            textColor: stopColor,
            systemImageName: "stop.circle"
        )

        let snoozeColor = snoozeButtonColor != nil ? colorFromHex(snoozeButtonColor!) : Color.white
        let snoozeButton = AlarmButton(
            text: LocalizedStringResource(stringLiteral: snoozeButtonLabel),
            textColor: snoozeColor,
            systemImageName: "clock.badge.checkmark"
        )

        let alertPresentation = AlarmPresentation.Alert(
            title: LocalizedStringResource(stringLiteral: title),
            stopButton: stopButton,
            secondaryButton: snoozeButton,
            secondaryButtonBehavior: .countdown
        )

        let presentation = AlarmPresentation(alert: alertPresentation)
        let countdownDuration = Alarm.CountdownDuration(preAlert: nil, postAlert: TimeInterval(snoozeDuration))
        let alarmTintColor = tintColorHex != nil ? colorFromHex(tintColorHex!) : Color.blue
        let attributes = AlarmAttributes<Meta>(presentation: presentation, metadata: Meta(), tintColor: alarmTintColor)

        let alarmSound: AlertConfiguration.AlertSound
        if let soundName = soundName, !soundName.isEmpty {
            alarmSound = .named(soundName)
        } else {
            alarmSound = .default
        }

        let stopIntent: any LiveActivityIntent = launchAppOnDismiss
            ? AlarmDismissIntentWithLaunch(alarmId: id, payload: dismissPayload)
            : AlarmDismissIntent(alarmId: id, payload: dismissPayload)

        let secondaryIntent: (any LiveActivityIntent)?
        if doSnoozeIntent {
            secondaryIntent = launchAppOnSnooze
                ? AlarmSnoozeIntentWithLaunch(alarmId: id, payload: snoozePayload)
                : AlarmSnoozeIntent(alarmId: id, payload: snoozePayload)
        } else {
            secondaryIntent = nil
        }

        let config = AlarmManager.AlarmConfiguration<Meta>(
            countdownDuration: countdownDuration,
            schedule: schedule,
            attributes: attributes,
            stopIntent: stopIntent,
            secondaryIntent: secondaryIntent,
            sound: alarmSound
        )

        do {
            try await AlarmManager.shared.schedule(id: uuid, configuration: config)
            ExpoAlarmKitStorage.setAlarm(id: id, value: -1)
            return true
        } catch {
            print("[ExpoAlarmKit] Failed to schedule repeating alarm: \(error)")
            return false
        }
    }
    #endif
}
