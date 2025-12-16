import SwiftUI
import Combine
import WatchConnectivity
import WatchKit

struct ContentView: View {
    @StateObject private var model = WatchViewModel()
    @State private var showingConfirmation = false

    var body: some View {
        ZStack {
            LinearGradient(colors: [.init(red: 0.08, green: 0.11, blue: 0.2), .init(red: 0.02, green: 0.06, blue: 0.12)],
                           startPoint: .top,
                           endPoint: .bottom)
                .ignoresSafeArea()
            VStack(spacing: 20) {
                Spacer() // Push content to center
                timerCard
                logButton
                Spacer() // Push content to center
            }
            .padding(.horizontal, 12)
        }
        .onAppear { model.activate() }
        .confirmationDialog("Log cigarette?", isPresented: $showingConfirmation, titleVisibility: .visible) {
            Button("Confirm", role: .destructive) {
                model.logCigarette()
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("This will reset your timer")
        }
    }
    
    private var timerCard: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Time Smoke-Free")
                .font(.caption)
                .foregroundColor(.cyan.opacity(0.8))
            Text(model.smokeFreeDuration)
                .font(.system(size: 28, weight: .semibold, design: .rounded))
                .frame(maxWidth: .infinity, alignment: .leading)
            Text("Last cigarette \(model.lastCigaretteText)")
                .font(.footnote)
                .foregroundColor(.secondary)
            HStack(spacing: 6) {
                Image(systemName: "calendar")
                    .font(.caption2)
                    .foregroundColor(.cyan.opacity(0.8))
                Text("Today \(model.todayText)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 6)
            .padding(.horizontal, 10)
            .background(Color.white.opacity(0.08))
            .clipShape(Capsule())
        }
        .padding()
        .background(Color.black.opacity(0.4))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
    
    private var logButton: some View {
        let readyColor = Color(red: 0.22, green: 0.74, blue: 0.97) // #38bdf8 sky blue
        let earlyColor = Color(red: 1.0, green: 0.267, blue: 0.267) // #ff4444 softer red
        let currentColor = model.isEarly ? earlyColor : readyColor

        return Button(action: { showingConfirmation = true }) {
            HStack {
                Image(systemName: "square.and.pencil")
                Text("Log Cigarette")
            }
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
        }
        .buttonStyle(.plain)
        .background(currentColor.opacity(0.12))
        .foregroundColor(model.isEarly ? earlyColor : .white)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(currentColor.opacity(0.5), lineWidth: 1.2)
        )
        .scaleEffect(model.logButtonPulse ? 0.94 : 1)
    }
    
    struct MetricChip: View {
        let title: String
        let value: String
        let icon: String
        
        var body: some View {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 4) {
                    Image(systemName: icon)
                    Text(title)
                }
                .font(.caption2)
                .foregroundColor(.secondary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
                
                Text(value)
                    .font(.callout)
                    .bold()
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(10)
            .background(Color.black.opacity(0.35))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
    }
    
    final class WatchViewModel: NSObject, ObservableObject, WCSessionDelegate {
        @Published var smokeFreeDuration = "Loading..."
        @Published var streakDays = 0
        @Published var achievements: [String] = []
        @Published var lastCigaretteText = "just now"
        @Published var logButtonPulse = false
        @Published var todayText = "0/0"
        @Published var avoidedText = "--"
        @Published var moneySavedText = "$0.00"
        @Published var currencySymbol = "$"
        @Published var isEarly = false
        
        private var smokeFreeAnchor: Date? {
            didSet {
                // start timer to update duration
                updateSmokeFreeDuration()
                timer?.invalidate()
                timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
                    self?.updateSmokeFreeDuration()
                }
                goalHapticTriggered = false
                wasBelowTarget = true
                hasInitializedDuration = false
            }
        }
        private var timer: Timer?
        private var targetIntervalSeconds: Double = 3600
        private var goalHapticTriggered = false
        private var wasBelowTarget = true
        private var hasInitializedDuration = false
        private static let relativeFormatter: RelativeDateTimeFormatter = {
            let formatter = RelativeDateTimeFormatter()
            formatter.unitsStyle = .full
            return formatter
        }()
        private static let currencyFormatter: NumberFormatter = {
            let f = NumberFormatter()
            f.numberStyle = .currency
            f.minimumFractionDigits = 2
            f.maximumFractionDigits = 2
            return f
        }()

        private let session = WCSession.isSupported() ? WCSession.default : nil
        private var pendingMessages: [[String: Any]] = []
        private var isActivated = false
        private var hasRequestedSnapshot = false
        
        deinit {
            timer?.invalidate()
        }
        
        func activate() {
            guard let session = session else { return }
            session.delegate = self
            print("[Watch] activating WCSession, state:", session.activationState.rawValue, "reachable:", session.isReachable)
            if session.activationState != .activated {
                session.activate()
            } else {
                isActivated = true
                applySnapshot(session.receivedApplicationContext)
                applySnapshot(session.applicationContext)
                requestSnapshot()
            }
        }
        
        func logCigarette() {
            print("[Watch] logCigarette tapped")
            // Optimistically reset timer locally so the watch updates immediately
            smokeFreeAnchor = Date()

            // Optimistically increment today's count for immediate feedback
            let parts = todayText.split(separator: "/")
            if parts.count == 2,
               let currentCount = Int(parts[0]),
               let dailyLimit = Int(parts[1]) {
                todayText = "\(currentCount + 1)/\(dailyLimit)"
            }

            WKInterfaceDevice.current().play(.success)
            withAnimation(.easeOut(duration: 0.2)) {
                logButtonPulse = true
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { [weak self] in
                withAnimation(.spring()) {
                    self?.logButtonPulse = false
                }
            }
            sendMessage(["type": "log_cigarette"])
        }
        
        private func sendMessage(_ message: [String: Any]) {
            guard let session = session else { return }
            
            let isAction = (message["type"] as? String) != "request_snapshot"

            // Always push action redundantly so it arrives even if not reachable
            if isAction {
                session.transferUserInfo(message)
                do {
                    try session.updateApplicationContext(["action": message["type"] as? String ?? "", "ts": Date().timeIntervalSince1970])
                } catch {
                    print("[Watch] updateApplicationContext action error:", error.localizedDescription)
                }
            }

            // If not ready/reachable, queue and bail after transfer/app context
            if session.activationState != .activated || !isActivated || !session.isReachable {
                print("[Watch] queue message (state:", session.activationState.rawValue, "reachable:", session.isReachable, "):", message)
                pendingMessages.append(message)
                if session.activationState != .activated {
                    session.activate()
                }
                return
            }
            
            print("[Watch] sendMessage direct:", message)
            session.sendMessage(
                message,
                replyHandler: { [weak self] reply in
                    self?.applySnapshot(reply)
                },
                errorHandler: { error in
                    print("[Watch] sendMessage error:", error.localizedDescription)
                }
            )
        }
        
        private func requestSnapshot() {
            guard let session = session else { return }
            
            if session.activationState != .activated || !isActivated {
                if !hasRequestedSnapshot {
                    pendingMessages.append(["type": "request_snapshot"])
                    hasRequestedSnapshot = true
                }
                if session.activationState != .activated {
                    session.activate()
                }
                applySnapshot(session.receivedApplicationContext)
                applySnapshot(session.applicationContext)
                return
            }
            
            if session.isReachable {
                print("[Watch] requestSnapshot via sendMessage")
                session.sendMessage(["type": "request_snapshot"], replyHandler: { [weak self] reply in
                    self?.applySnapshot(reply)
                }, errorHandler: { error in
                    print("[Watch] snapshot request error:", error.localizedDescription)
                })
            } else {
                print("[Watch] requestSnapshot using cached context (unreachable)")
                applySnapshot(session.receivedApplicationContext)
                applySnapshot(session.applicationContext)
            }
        }
        
        private func updateSmokeFreeDuration() {
            guard let anchor = smokeFreeAnchor else { return }
            let duration = Date().timeIntervalSince(anchor)
            
            let seconds = Int(duration)
            let s = seconds % 60
            let m = (seconds / 60) % 60
            let h = (seconds / 3600) % 24
            let d = (seconds / 86400)
            
            var parts: [String] = []
            if d > 0 { parts.append("\(d)d") }
            if h > 0 { parts.append("\(h)h") }
            if m > 0 { parts.append("\(m)m") }
            if d == 0 { parts.append("\(s)s") }
            
            let formatted = parts.joined(separator: " ")
            DispatchQueue.main.async {
                self.smokeFreeDuration = formatted
                self.isEarly = duration < self.targetIntervalSeconds
                // First render after snapshot/activation: set baseline, skip haptic
                if !self.hasInitializedDuration {
                    self.hasInitializedDuration = true
                    self.wasBelowTarget = duration < self.targetIntervalSeconds
                    self.goalHapticTriggered = !self.wasBelowTarget
                    return
                }

                let isBelowTarget = duration < self.targetIntervalSeconds
                if !isBelowTarget && self.wasBelowTarget && !self.goalHapticTriggered {
                    self.goalHapticTriggered = true
                    self.wasBelowTarget = false
                    WKInterfaceDevice.current().play(.notification)
                } else if isBelowTarget {
                    self.wasBelowTarget = true
                    self.goalHapticTriggered = false
                }
            }
        }

        private static func symbol(for code: String?, fallback: String = "$") -> String {
            guard let code = code?.uppercased() else { return fallback }
            switch code {
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
            default: return fallback
            }
        }

        private func formatMoney(_ amount: Double, currencyCode: String?, symbol: String?) -> String {
            let formatter = WatchViewModel.currencyFormatter
            if let code = currencyCode {
                formatter.currencyCode = code
            }
            if let sym = symbol ?? currencyCode.flatMap({ WatchViewModel.symbol(for: $0) }) {
                formatter.currencySymbol = sym
            }
            return formatter.string(from: NSNumber(value: amount)) ?? "\((symbol ?? "$"))\(String(format: "%.2f", amount))"
        }

        private func applySnapshot(_ message: [String: Any]) {
            guard !message.isEmpty else {
                print("[Watch] applySnapshot received empty message")
                return
            }
            print("[Watch] applySnapshot received message keys:", message.keys.sorted())
            print("[Watch] todayCount:", message["todayCount"] ?? "nil", "dailyLimit:", message["dailyLimit"] ?? "nil")
            print("[Watch] moneySaved:", message["moneySaved"] ?? "nil", "cigarettesAvoided:", message["cigarettesAvoided"] ?? "nil")
            DispatchQueue.main.async {
                var incomingDate: Date?
                if let epoch = message["lastCigaretteEpoch"] as? Double {
                    incomingDate = Date(timeIntervalSince1970: epoch)
                } else if let iso = message["lastCigarette"] as? String,
                          let date = ISO8601DateFormatter().date(from: iso) {
                    incomingDate = date
                } else if let quitDateTime = message["quitDate"] as? TimeInterval {
                    incomingDate = Date(timeIntervalSince1970: quitDateTime)
                }

                if let incoming = incomingDate {
                    if let current = self.smokeFreeAnchor, incoming < current {
                        print("[Watch] ignore older snapshot anchor:", incoming)
                    } else {
                        self.smokeFreeAnchor = incoming
                        self.updateSmokeFreeDuration()
                        self.lastCigaretteText = WatchViewModel.relativeFormatter.localizedString(for: incoming, relativeTo: Date())
                    }
                } else if let duration = message["smokeFreeDuration"] as? String, self.smokeFreeAnchor == nil {
                    self.smokeFreeDuration = duration
                    self.lastCigaretteText = duration
                }
                if let streak = message["streakDays"] as? Int {
                    self.streakDays = streak
                }
                // Update today's count
                let todayCount = message["todayCount"] as? Int ?? 0
                let dailyLimit = message["dailyLimit"] as? Int ?? 0
                self.todayText = "\(todayCount)/\(dailyLimit)"

                if let avoided = message["cigarettesAvoided"] as? Int {
                    self.avoidedText = "\(avoided)"
                } else if let avoidedDouble = message["cigarettesAvoided"] as? Double {
                    self.avoidedText = "\(Int(avoidedDouble.rounded()))"
                }
                let currencyCode = message["currency"] as? String
                if let code = currencyCode {
                    self.currencySymbol = WatchViewModel.symbol(for: code, fallback: self.currencySymbol)
                }
                if let symbol = message["currencySymbol"] as? String {
                    self.currencySymbol = symbol
                }
                if let saved = message["moneySaved"] as? Double {
                    print("[Watch] Received moneySaved as Double:", saved)
                    self.moneySavedText = self.formatMoney(saved, currencyCode: currencyCode, symbol: self.currencySymbol)
                } else if let savedNumber = message["moneySaved"] as? NSNumber {
                    print("[Watch] Received moneySaved as NSNumber:", savedNumber.doubleValue)
                    self.moneySavedText = self.formatMoney(savedNumber.doubleValue, currencyCode: currencyCode, symbol: self.currencySymbol)
                } else {
                    print("[Watch] moneySaved not found or wrong type in message")
                }
                if let ti = message["targetInterval"] as? Double {
                    let seconds = ti * 60
                    if abs(seconds - self.targetIntervalSeconds) > 0.5 {
                        self.goalHapticTriggered = false
                        self.wasBelowTarget = true
                        self.hasInitializedDuration = false
                    }
                    self.targetIntervalSeconds = seconds
                } else if let tiInt = message["targetInterval"] as? Int {
                    let seconds = Double(tiInt * 60)
                    if abs(seconds - self.targetIntervalSeconds) > 0.5 {
                        self.goalHapticTriggered = false
                        self.wasBelowTarget = true
                        self.hasInitializedDuration = false
                    }
                    self.targetIntervalSeconds = seconds
                }
                // Ignore achievements on watch UI
            }
        }
        
        // MARK: WCSessionDelegate
        func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
            isActivated = (activationState == .activated)
            guard activationState == .activated else { return }
            
            print("[Watch] WCSession activated (reachable:", session.isReachable, ")")
            // flush queued messages now that we're activated
            let queued = pendingMessages
            pendingMessages.removeAll()
            hasRequestedSnapshot = false
            queued.forEach { sendMessage($0) }
            
            // ensure we have a snapshot
            requestSnapshot()
        }
        
        func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
            applySnapshot(applicationContext)
        }
        
        func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
            applySnapshot(message)
        }
        
        // MARK: - Optional WCSessionDelegate methods

        #if os(iOS)
        func sessionDidBecomeInactive(_ session: WCSession) {
            print("[Watch] session became inactive")
        }

        func sessionDidDeactivate(_ session: WCSession) {
            print("[Watch] session deactivated")
        }
        #endif

        func sessionReachabilityDidChange(_ session: WCSession) {
            print("[Watch] reachabilityDidChange:", session.isReachable)
            if session.isReachable && isActivated {
                let queued = pendingMessages
                pendingMessages.removeAll()
                queued.forEach { sendMessage($0) }
                requestSnapshot()
            }
        }
    }
}
