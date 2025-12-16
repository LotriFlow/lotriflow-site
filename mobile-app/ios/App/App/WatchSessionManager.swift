import Foundation
import WatchConnectivity
import Capacitor

/// Bridges messages between the watch extension and the host (Capacitor) app.
/// Replace the placeholders to load real data from your JS app and route actions back.
final class WatchSessionManager: NSObject, WCSessionDelegate {
    static let shared = WatchSessionManager()
    private override init() { super.init() }
    private var session: WCSession? {
        WCSession.isSupported() ? WCSession.default : nil
    }
    weak var bridge: CAPBridgeProtocol?
    private var defaultsObserver: NSObjectProtocol?
    private var needsJsRefresh = false
    private var lastWatchLogProcessedAt: Date?
    private let duplicateLogWindow: TimeInterval = 1.5
    private var lastSnapshotPayload: [String: Any]?
    private var pushWorkItem: DispatchWorkItem?

    private func makeISOFormatter() -> ISO8601DateFormatter {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }
    private var refreshTimer: Timer?

    func start() {
        guard let session = session else { return }
        session.delegate = self
        session.activate()
        print("[WatchBridge] start session state:", session.activationState.rawValue, "reachable:", session.isReachable)
        if defaultsObserver == nil {
            defaultsObserver = NotificationCenter.default.addObserver(
                forName: UserDefaults.didChangeNotification,
                object: nil,
                queue: nil
            ) { [weak self] _ in
                guard let self = self else { return }
                let defaults = UserDefaults.standard
                let hasSnapshot = defaults.object(forKey: "CapacitorStorage.watch_snapshot") != nil ||
                                  defaults.object(forKey: "watch_snapshot") != nil
                if hasSnapshot {
                    DispatchQueue.main.async { [weak self] in
                        self?.pushSnapshotToWatch()
                    }
                }
            }
        }
        // Push an initial snapshot shortly after activation starts
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { [weak self] in
            self?.pushSnapshotToWatch()
        }
        
        // Periodically request a snapshot update from the JS layer.
        // This ensures the watch stays in sync even if the app is just sitting open.
        DispatchQueue.main.async { [weak self] in
            self?.refreshTimer?.invalidate()
            self?.refreshTimer = Timer.scheduledTimer(withTimeInterval: 10.0, repeats: true) { [weak self] _ in
                guard let self = self, let bridge = self.bridge else { return }
                // This JS call should trigger the UserDefaults observer if the snapshot has changed.
                _ = bridge.eval(js: "window.updateWatchSnapshot && window.updateWatchSnapshot();")
            }
        }

        NotificationCenter.default.addObserver(
            forName: UIApplication.willEnterForegroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.triggerPendingJsRefresh()
        }
    }
    
    func stop() {
        refreshTimer?.invalidate()
    }

    // MARK: WCSessionDelegate
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if activationState == .activated {
            print("[WatchBridge] WCSession activated (reachable:", session.isReachable, ")")
            pushSnapshotToWatch()
        } else if let error = error {
            print("[WatchBridge] activation error:", error.localizedDescription)
        }
    }
    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) { session.activate() }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        guard let type = message["type"] as? String else { return }
        print("[WatchBridge] received message:", type, message)

        switch type {
        case "request_snapshot":
            debugDumpSnapshots(context: "request_snapshot")
            replyHandler(makeSnapshot())
        case "log_cigarette":
            print("[WatchBridge] handling log_cigarette (native + JS)")
            // Try JS first
            if let bridge = bridge {
            _ = bridge.eval(js: "window.handleWatchAction && window.handleWatchAction('log_cigarette')")
            _ = bridge.eval(js: "window.updateWatchSnapshot && window.updateWatchSnapshot(); true;")
        }
        // Native fallback to ensure timer resets
        let snap = applyNativeLog()
        WatchBridgePlugin.shared?.notifyAction("log_cigarette")
        debugDumpSnapshots(context: "log_cigarette_message")
        replyHandler(snap)
        pushSnapshotToWatch()
        case "start_breathing":
            print("[WatchBridge] handling start_breathing (native)")
            if let bridge = bridge {
                _ = bridge.eval(js: "window.handleWatchAction && window.handleWatchAction('start_breathing')")
                _ = bridge.eval(js: "window.updateWatchSnapshot && window.updateWatchSnapshot(); true;")
            }
            WatchBridgePlugin.shared?.notifyAction("start_breathing")
            pushSnapshotToWatch()
        default:
            break;
        }
    }

    func session(_ session: WCSession, didReceiveUserInfo userInfo: [String : Any] = [:]) {
        guard let type = userInfo["type"] as? String else { return }
        print("[WatchBridge] received userInfo:", type, userInfo)
        switch type {
        case "log_cigarette":
            print("[WatchBridge] handling log_cigarette (userInfo, native + JS)")
            if let bridge = bridge {
                _ = bridge.eval(js: "window.handleWatchAction && window.handleWatchAction('log_cigarette')")
                _ = bridge.eval(js: "window.updateWatchSnapshot && window.updateWatchSnapshot(); true;")
            }
            applyNativeLog()
            WatchBridgePlugin.shared?.notifyAction("log_cigarette")
            pushSnapshotToWatch()
        case "start_breathing":
            print("[WatchBridge] handling start_breathing (userInfo)")
            if let bridge = bridge {
                _ = bridge.eval(js: "window.handleWatchAction && window.handleWatchAction('start_breathing')")
                _ = bridge.eval(js: "window.updateWatchSnapshot && window.updateWatchSnapshot(); true;")
            }
            WatchBridgePlugin.shared?.notifyAction("start_breathing")
            pushSnapshotToWatch()
        default:
            break
        }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
        print("[WatchBridge] received applicationContext:", applicationContext)
        if let action = applicationContext["action"] as? String {
            let js = "window.handleWatchAction && window.handleWatchAction('\(action)')"
            bridge?.eval(js: js)
            if action == "log_cigarette" {
                applyNativeLog()
            }
            WatchBridgePlugin.shared?.notifyAction(action)
            debugDumpSnapshots(context: "applicationContext_action_\(action)")
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak self] in
                self?.pushSnapshotToWatch()
            }
        }
    }

    func pushSnapshotToWatch() {
        guard let session = session, session.activationState == .activated else { return }
        let snapshot = makeSnapshot()
        
        // Deduplicate identical payloads to avoid jitter/freezes on the watch
        if let last = lastSnapshotPayload,
           NSDictionary(dictionary: last).isEqual(to: snapshot) {
            return
        }
        lastSnapshotPayload = snapshot

        // Debounce pushes to avoid flooding the session
        pushWorkItem?.cancel()
        let work = DispatchWorkItem { [weak self, weak session] in
            guard let session = session else { return }
            print("[WatchBridge] pushing snapshot to watch:", snapshot)

            if session.isReachable {
                session.sendMessage(snapshot, replyHandler: nil, errorHandler: { error in
                    print("[WatchBridge] push snapshot error:", error.localizedDescription)
                })
            }

            do {
                try session.updateApplicationContext(snapshot)
            } catch {
                print("[WatchBridge] updateApplicationContext error:", error.localizedDescription)
            }
        }
        pushWorkItem = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.35, execute: work)
    }

    private func makeSnapshot() -> [String: Any] {
        let iso = makeISOFormatter()
        var candidates: [[String: Any]] = []

        if let fromState = snapshotFromMainState() {
            candidates.append(fromState)
        }
        if let stored = loadStoredSnapshot() {
            candidates.append(stored)
        }

        // Avoid blocking the main thread waiting for JS; rely on stored snapshots
        if let bridge = bridge {
            _ = bridge.eval(js: "window.updateWatchSnapshot && window.updateWatchSnapshot();")
        }

        // Pick the freshest candidate (latest lastCigarette)
        let freshest = candidates.max { a, b in
            latestCigDate(from: a, iso: iso) < latestCigDate(from: b, iso: iso)
        }

        if let freshest = freshest {
            return normalizeSnapshot(freshest, iso: iso)
        }

        let defaultsFallback: [String: Any] = [
            "type": "snapshot",
            "smokeFreeDuration": "--",
            "streakDays": 0,
            "achievements": ["Logged a test achievement", "Smoke-free milestone"]
        ]
        print("[WatchBridge] makeSnapshot default fallback", defaultsFallback)
        return defaultsFallback
    }

    private func snapshotFromMainState() -> [String: Any]? {
        let defaults = UserDefaults.standard
        let keys = [
            "CapacitorStorage.lotriflow_smokefree_state",
            "lotriflow_smokefree_state"
        ]
        let iso = makeISOFormatter()
        for key in keys {
            guard let json = defaults.string(forKey: key),
                  let data = json.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { continue }

            var snapshot: [String: Any] = ["type": "snapshot"]
            snapshot["achievements"] = achievementsArray(from: obj)

            let (lastIso, lastDate) = lastCigarette(from: obj, iso: iso)
            if let iso = lastIso, let date = lastDate {
                snapshot["lastCigarette"] = iso
                snapshot["lastCigaretteEpoch"] = date.timeIntervalSince1970
                snapshot["smokeFreeDuration"] = durationString(since: date)
            } else {
                snapshot["smokeFreeDuration"] = "--"
            }

            if let log = obj["cigaretteLog"] as? [String] {
                snapshot["cigaretteLog"] = log
                snapshot["streakDays"] = computeStreak(from: log)
                snapshot["todayCount"] = computeTodayCount(from: log, iso: iso)
            }

            // Add daily limit
            if let limit = obj["dailyLimit"] as? Int {
                snapshot["dailyLimit"] = limit
            } else if let limitDouble = obj["dailyLimit"] as? Double {
                snapshot["dailyLimit"] = Int(limitDouble)
            } else {
                snapshot["dailyLimit"] = 10 // Default
            }

            if let ti = obj["targetInterval"] as? Int {
                snapshot["targetInterval"] = ti
            } else if let tiDouble = obj["targetInterval"] as? Double {
                snapshot["targetInterval"] = Int(tiDouble)
            }
            let metrics = computeAvoidedAndSaved(from: obj, iso: iso)
            if let avoided = metrics.avoided {
                snapshot["cigarettesAvoided"] = avoided
            }
            if let saved = metrics.moneySaved {
                snapshot["moneySaved"] = saved
            }
            snapshot["currency"] = metrics.currency
            snapshot["currencySymbol"] = currencySymbol(for: metrics.currency)

            // Debug log
            print("[WatchBridge] snapshotFromMainState:", [
                "packPrice": obj["packPrice"] ?? "nil",
                "cigsPerPack": obj["cigsPerPack"] ?? "nil",
                "baselinePerDay": obj["baselinePerDay"] ?? "nil",
                "cigarettesAvoided": snapshot["cigarettesAvoided"] ?? "nil",
                "moneySaved": snapshot["moneySaved"] ?? "nil"
            ])

            return snapshot
        }
        return nil
    }

    private func durationString(since date: Date) -> String {
        let elapsed = Int(Date().timeIntervalSince(date))
        let days = elapsed / 86400
        let hours = (elapsed % 86400) / 3600
        let mins = (elapsed % 3600) / 60
        if days > 0 { return "\(days)d \(hours)h" }
        if hours > 0 { return "\(hours)h \(mins)m" }
        return "\(max(mins, 0))m"
    }

    private func loadStoredSnapshot() -> [String: Any]? {
        let defaults = UserDefaults.standard
        let possibleKeys = [
            "CapacitorStorage.watch_snapshot",
            "watch_snapshot"
        ]

        let isoFormatter = makeISOFormatter()
        for key in possibleKeys {
            if let json = defaults.string(forKey: key),
               let data = json.data(using: .utf8),
               let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                return normalizeSnapshot(obj, iso: isoFormatter)
            }
        }
        return nil
    }

    private func shouldSkipDuplicateLog(at now: Date) -> Bool {
        guard let last = lastWatchLogProcessedAt else { return false }
        return now.timeIntervalSince(last) < duplicateLogWindow
    }

    @discardableResult
    private func applyNativeLog() -> [String: Any] {
        let defaults = UserDefaults.standard
        let isoFormatter = makeISOFormatter()
        let baseSnapshot = snapshotFromMainState() ?? loadStoredSnapshot()
        let nowDate = Date()
        if shouldSkipDuplicateLog(at: nowDate) {
            let existing = baseSnapshot ?? loadStoredSnapshot()
            print("[WatchBridge] duplicate log ignored (within \(duplicateLogWindow)s)")
            return existing ?? [
                "type": "snapshot",
                "achievements": [],
                "streakDays": 0,
                "cigaretteLog": []
            ]
        }
        var snapshot = baseSnapshot ?? [
            "type": "snapshot",
            "achievements": ["Logged a test achievement", "Smoke-free milestone"],
            "streakDays": 0,
            "cigaretteLog": []
        ]
        if snapshot["targetInterval"] == nil {
            if let base = baseSnapshot, let ti = base["targetInterval"] {
                snapshot["targetInterval"] = ti
            } else if let defaultsTarget = defaults.integer(forKey: "targetInterval") as Int?, defaultsTarget > 0 {
                snapshot["targetInterval"] = defaultsTarget
            } else {
                snapshot["targetInterval"] = 60
            }
        }
        let now = isoFormatter.string(from: nowDate)
        lastWatchLogProcessedAt = nowDate
        snapshot["lastCigarette"] = now
        snapshot["lastCigaretteEpoch"] = nowDate.timeIntervalSince1970
        snapshot["smokeFreeDuration"] = "0m"
        
        // Update snapshot log for watch display (JS will handle the actual state update)
        var log = snapshot["cigaretteLog"] as? [String] ?? []
        log.append(now)
        snapshot["cigaretteLog"] = log
        snapshot["streakDays"] = computeStreak(from: log)

        // Only update main app state if JS bridge is NOT available (app in background)
        // When JS is active, let JS handle the state update to avoid double-counting
        let jsAvailable = bridge?.webView != nil
        
        if !jsAvailable {
            // JS not running - update main state natively as fallback
            let keys = [
                "lotriflow_smokefree_state",
                "CapacitorStorage.lotriflow_smokefree_state"
            ]

            for key in keys {
                guard let stateString = defaults.string(forKey: key),
                      let data = stateString.data(using: .utf8),
                      var state = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { continue }

                var cigLog = state["cigaretteLog"] as? [String] ?? []
                cigLog.append(now)
                state["cigaretteLog"] = cigLog
                state["lastCigarette"] = now
                state["lastGoalNotified"] = 0
                if let updated = try? JSONSerialization.data(withJSONObject: state, options: []),
                   let updatedString = String(data: updated, encoding: .utf8) {
                    defaults.set(updatedString, forKey: key)
                    print("[WatchBridge] applyNativeLog updated main state for key", key, "(JS unavailable)")
                }
            }
        } else {
            print("[WatchBridge] applyNativeLog skipping main state update (JS will handle)")
        }

        // Persist refreshed snapshot with avoided/savings included
        let updatedSnapshot = snapshotFromMainState() ?? normalizeSnapshot(snapshot, iso: isoFormatter)
        let jsonData = try? JSONSerialization.data(withJSONObject: updatedSnapshot, options: [])
        if let data = jsonData, let jsonString = String(data: data, encoding: .utf8) {
            defaults.set(jsonString, forKey: "CapacitorStorage.watch_snapshot")
            defaults.set(jsonString, forKey: "watch_snapshot")
            print("[WatchBridge] applyNativeLog stored snapshot", updatedSnapshot)
        }

        // If JS bridge is active, also trigger the JS handler to refresh UI immediately
        if let bridge = bridge {
            _ = bridge.eval(js: "window.handleWatchAction && window.handleWatchAction('log_cigarette')")
            _ = bridge.eval(js: "window.updateWatchSnapshot && window.updateWatchSnapshot(); true;")
            _ = bridge.eval(js: "window.refreshStateFromStorage && window.refreshStateFromStorage();")
        } else {
            needsJsRefresh = true
        }

        return updatedSnapshot
    }

    // Debug helper to dump snapshot-related storage to Xcode logs
    private func debugDumpSnapshots(context: String) {
        let defaults = UserDefaults.standard
        let statePrimary = defaults.string(forKey: "lotriflow_smokefree_state") ?? "nil"
        let statePrefixed = defaults.string(forKey: "CapacitorStorage.lotriflow_smokefree_state") ?? "nil"
        let watchSnapshot = defaults.string(forKey: "watch_snapshot") ?? "nil"
        let watchSnapshotPrefixed = defaults.string(forKey: "CapacitorStorage.watch_snapshot") ?? "nil"
        let computed = makeSnapshot()
        print("[WatchBridge][Dump][\(context)] state primary:", statePrimary)
        print("[WatchBridge][Dump][\(context)] state prefixed:", statePrefixed)
        print("[WatchBridge][Dump][\(context)] stored watch_snapshot:", watchSnapshot)
        print("[WatchBridge][Dump][\(context)] stored prefixed watch_snapshot:", watchSnapshotPrefixed)
        print("[WatchBridge][Dump][\(context)] computed snapshot:", computed)
    }

    private func lastCigarette(from obj: [String: Any], iso: ISO8601DateFormatter) -> (String?, Date?) {
        if let last = obj["lastCigarette"] as? String,
           let date = iso.date(from: last) {
            return (last, date)
        }
        if let log = obj["cigaretteLog"] as? [String],
           let last = log.last,
           let date = iso.date(from: last) {
            return (last, date)
        }
        return (nil, nil)
    }

    private func achievementsArray(from obj: [String: Any]) -> [String] {
        if let achievements = obj["achievements"] as? [String: Any] {
            return achievements.values.map { ($0 as? [String: Any])?["title"] as? String ?? "" }
        }
        if let achievementsArray = obj["achievements"] as? [String] {
            return achievementsArray
        }
        return ["Logged a test achievement", "Smoke-free milestone"]
    }

    private func triggerPendingJsRefresh() {
        guard needsJsRefresh, let bridge = bridge else { return }
        needsJsRefresh = false
        _ = bridge.eval(js: "window.refreshStateFromStorage && window.refreshStateFromStorage();")
        _ = bridge.eval(js: "window.updateWatchSnapshot && window.updateWatchSnapshot(); true;")
    }

    private func latestCigDate(from snapshot: [String: Any], iso: ISO8601DateFormatter) -> Date {
        if let last = snapshot["lastCigarette"] as? String,
           let date = iso.date(from: last) {
            return date
        }
        if let log = snapshot["cigaretteLog"] as? [String],
           let last = log.last,
           let date = iso.date(from: last) {
            return date
        }
        return Date.distantPast
    }

    private func currencySymbol(for code: String) -> String {
        switch code.uppercased() {
        case "USD": return "$"
        case "EUR": return "€"
        case "GBP": return "£"
        case "JPY", "CNY": return "¥"
        case "AUD": return "A$"
        case "CAD": return "C$"
        case "CHF": return "CHF"
        case "INR": return "₹"
        case "RUB": return "₽"
        case "BRL": return "R$"
        case "ZAR": return "R"
        case "MXN": return "$"
        case "KRW": return "₩"
        case "TRY": return "₺"
        case "PLN": return "zł"
        case "THB": return "฿"
        case "IDR": return "Rp"
        case "MYR": return "RM"
        case "PHP": return "₱"
        case "VND": return "₫"
        case "AED": return "AED"
        case "SAR": return "SAR"
        case "EGP": return "E£"
        case "NGN": return "₦"
        default: return "$"
        }
    }

    private func computeAvoidedAndSaved(from obj: [String: Any], iso: ISO8601DateFormatter) -> (avoided: Int?, moneySaved: Double?, currency: String) {
        let currency = (obj["currency"] as? String) ?? "USD"
        let baseline: Double = {
            if let val = obj["baselinePerDay"] as? Double { return val }
            if let num = obj["baselinePerDay"] as? NSNumber { return num.doubleValue }
            if let val = obj["dailyLimit"] as? Double { return val }
            if let num = obj["dailyLimit"] as? NSNumber { return num.doubleValue }
            return 10
        }()
        guard baseline > 0 else { return (nil, nil, currency) }

        var candidates: [Date] = []
        if let quit = obj["quitDate"] as? String, let date = iso.date(from: quit) {
            candidates.append(date)
        }
        if let last = lastCigarette(from: obj, iso: iso).1 {
            candidates.append(last)
        }
        if let log = obj["cigaretteLog"] as? [String] {
            let dates = log.compactMap { iso.date(from: $0) }
            if let first = dates.min() {
                candidates.append(first)
            }
        }
        guard let start = candidates.min() else { return (nil, nil, currency) }

        let elapsed = max(Date().timeIntervalSince(start), 0)
        let expectedDays = max(elapsed / 86_400.0, 1.0)
        let expected = baseline * expectedDays
        let actual = Double((obj["cigaretteLog"] as? [String])?.count ?? 0)
        let avoided = max(0, Int(floor(expected - actual)))

        let packPrice: Double = {
            if let val = obj["packPrice"] as? Double { return val }
            if let num = obj["packPrice"] as? NSNumber { return num.doubleValue }
            return 0
        }()
        let cigsPerPack: Double = {
            if let val = obj["cigsPerPack"] as? Double { return val }
            if let num = obj["cigsPerPack"] as? NSNumber { return num.doubleValue }
            return 0
        }()
        let moneySaved: Double?
        if packPrice > 0, cigsPerPack > 0 {
            moneySaved = Double(avoided) * (packPrice / cigsPerPack)
        } else {
            moneySaved = nil
        }
        return (avoided, moneySaved, currency)
    }

    private func normalizeSnapshot(_ input: [String: Any], iso: ISO8601DateFormatter) -> [String: Any] {
        var obj = input
        obj["type"] = "snapshot"
        obj["achievements"] = achievementsArray(from: obj)
        if obj["cigaretteLog"] == nil {
            obj["cigaretteLog"] = []
        }
        if obj["currency"] == nil {
            obj["currency"] = "USD"
        }
        if obj["currencySymbol"] == nil, let code = obj["currency"] as? String {
            obj["currencySymbol"] = currencySymbol(for: code)
        }
        let (lastIso, lastDate) = lastCigarette(from: obj, iso: iso)
        if let isoStr = lastIso, let date = lastDate {
            obj["lastCigarette"] = isoStr
            obj["lastCigaretteEpoch"] = date.timeIntervalSince1970
            obj["smokeFreeDuration"] = durationString(since: date)
        } else {
            obj["smokeFreeDuration"] = obj["smokeFreeDuration"] ?? "--"
        }
        if obj["streakDays"] == nil {
            let log = obj["cigaretteLog"] as? [String] ?? []
            obj["streakDays"] = computeStreak(from: log)
        }

        // Add today's count and daily limit
        if obj["todayCount"] == nil || obj["dailyLimit"] == nil {
            let log = obj["cigaretteLog"] as? [String] ?? []
            let todayCount = computeTodayCount(from: log, iso: iso)
            obj["todayCount"] = todayCount

            // Get daily limit from state
            if let limit = obj["dailyLimit"] as? Int {
                obj["dailyLimit"] = limit
            } else if let limitDouble = obj["dailyLimit"] as? Double {
                obj["dailyLimit"] = Int(limitDouble)
            } else {
                obj["dailyLimit"] = 10 // Default fallback
            }
        }

        if obj["cigarettesAvoided"] == nil || obj["moneySaved"] == nil {
            let metrics = computeAvoidedAndSaved(from: obj, iso: iso)
            if obj["cigarettesAvoided"] == nil, let avoided = metrics.avoided {
                obj["cigarettesAvoided"] = avoided
            }
            if obj["moneySaved"] == nil, let saved = metrics.moneySaved {
                obj["moneySaved"] = saved
            }
            if obj["currency"] == nil {
                obj["currency"] = metrics.currency
            }
            if obj["currencySymbol"] == nil {
                obj["currencySymbol"] = currencySymbol(for: metrics.currency)
            }
        }
        return obj
    }

    private func computeTodayCount(from log: [String], iso: ISO8601DateFormatter) -> Int {
        let today = Calendar.current.startOfDay(for: Date())
        let todayEnd = Calendar.current.date(byAdding: .day, value: 1, to: today)!

        let todayLogs = log.compactMap { iso.date(from: $0) }.filter { logDate in
            logDate >= today && logDate < todayEnd
        }

        return todayLogs.count
    }

    private func computeStreak(from log: [String]) -> Int {
        let formatter = makeISOFormatter()
        let logDates = log.compactMap { formatter.date(from: $0) }
        guard let last = logDates.max() else { return 0 }
        let elapsed = Date().timeIntervalSince(last)
        let days = Int(floor(elapsed / 86_400.0))
        return max(days, 0)
    }
}
