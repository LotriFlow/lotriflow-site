import XCTest
import Foundation
import CoreGraphics

@MainActor
class ScreenshotTests: XCTestCase {
    
    var app: XCUIApplication!
    private var webView: XCUIElement { app.webViews.firstMatch }
    
    private enum UITestSection: String {
        case home
        case reports
        case achievements
        case coach
        case cravings
        case milestones
        case quitPlan
        case settings
    }
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        setupSnapshot(app)
        app.launchEnvironment["UITEST_SKIP_ONBOARDING"] = "1"
        app.launchEnvironment["UITEST_DISABLE_ANIMATIONS"] = "1"
        app.launchEnvironment["UITEST_FORCE_PRO"] = "1"
        app.launchArguments += ["-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryM"]
        app.launchArguments += ["-AppleLanguages", "(en)"]
        app.launchArguments += ["-AppleLocale", "en_US"]
        XCUIDevice.shared.orientation = .portrait
        seedSnapshotState()
    }
    
    override func tearDownWithError() throws {
        app = nil
    }

    /// Pre-seed Capacitor Preferences so onboarding doesn't block snapshots.
    private func seedSnapshotState() {
        let now = ISO8601DateFormatter().string(from: Date())
        let state: [String: Any] = [
            "firstRun": false,
            "lastCigarette": now,
            "quitDate": now,
            "dailyLimit": 10,
            "baselinePerDay": 10,
            "targetInterval": 60,
            "packPrice": 8,
            "cigsPerPack": 20,
            "currency": "USD",
            "cigaretteLog": [],
            "cravingsLog": [],
            "achievements": [:],
            "coachMood": "neutral",
            "autoIncreaseAmount": 5,
            "forcePro": true
        ]

        if let data = try? JSONSerialization.data(withJSONObject: state),
           let json = String(data: data, encoding: .utf8) {
            // Write to the app's defaults domain (bundle id) so the app reads it, not the test bundle.
            let appDefaults = UserDefaults(suiteName: "com.lotriflow.quitcoach") ?? .standard
            appDefaults.set(json, forKey: "CapacitorStorage.lotriflow_smokefree_state")
            appDefaults.synchronize()
            
            // Also set on the test bundle defaults as a fallback
            UserDefaults.standard.set(json, forKey: "CapacitorStorage.lotriflow_smokefree_state")
            UserDefaults.standard.synchronize()
        }
    }
    
    /// Tap a control inside the WKWebView by (approximate) label.
    private func tapInWebView(_ label: String, timeout: TimeInterval = 6) -> Bool {
        guard webView.waitForExistence(timeout: timeout) else { return false }

        func tapElement(_ element: XCUIElement) -> Bool {
            guard element.exists else { return false }
            if element.isHittable {
                element.press(forDuration: 0.1)
                return true
            }
            // Fallback: tap center coordinate if we have a valid frame
            if element.frame != .zero {
                let coord = element.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
                coord.press(forDuration: 0.1)
                return true
            }
            return false
        }

        // Try exact matches first for various element types
        let exactMatches: [XCUIElement] = [
            webView.buttons[label],
            webView.links[label],
            webView.otherElements[label],
            webView.staticTexts[label]
        ]

        for element in exactMatches {
            if element.waitForExistence(timeout: 2), tapElement(element) {
                return true
            }
        }

        // Try containing predicate with longer timeout
        let predicate = NSPredicate(format: "label CONTAINS[c] %@", label)
        let queries: [XCUIElementQuery] = [
            webView.buttons.containing(predicate),
            webView.links.containing(predicate),
            webView.otherElements.containing(predicate),
            webView.staticTexts.containing(predicate)
        ]
        for query in queries {
            let el = query.firstMatch
            if el.waitForExistence(timeout: 2), tapElement(el) { return true }
        }
        return false
    }

    /// Tap by normalized coordinate in the webview (0...1).
    private func tapInWebView(at x: CGFloat, _ y: CGFloat) {
        guard webView.waitForExistence(timeout: 5) else { return }
        let coord = webView.coordinate(withNormalizedOffset: CGVector(dx: x, dy: y))
        coord.press(forDuration: 0.1)
    }

    /// Execute JavaScript in the webview to navigate directly.
    private func executeJS(_ script: String) {
        guard webView.waitForExistence(timeout: 5) else { return }
        // Tap webview to ensure it's focused, then type the JavaScript
        // We'll use a workaround since XCUITest doesn't directly support JS execution
        // Instead, we'll use a custom URL scheme that the app can intercept
        // For now, use double-tap to try to trigger interactions
        webView.tap()
        sleep(1)
    }

    /// Navigate to a section by calling JavaScript directly via typing into address bar trick
    private func navigateToSection(_ section: String) {
        // XCUITest doesn't have direct JS execution, so we need to tap the actual nav buttons
        // Use a more aggressive tap approach with force press
        switch section.lowercased() {
        case "achievements", "badges", "reports":
            // Tap Reports tab
            let reportsCoord = webView.coordinate(withNormalizedOffset: CGVector(dx: 0.12, dy: 0.93))
            reportsCoord.tap()
            sleep(1)
            reportsCoord.tap()  // Double-tap
        case "coach":
            let coachCoord = webView.coordinate(withNormalizedOffset: CGVector(dx: 0.52, dy: 0.93))
            coachCoord.tap()
            sleep(1)
            coachCoord.tap()
        case "health", "milestones":
            let healthCoord = webView.coordinate(withNormalizedOffset: CGVector(dx: 0.88, dy: 0.93))
            healthCoord.tap()
            sleep(1)
            healthCoord.tap()
        default:
            break
        }
        sleep(3)
    }

    /// Wait for a label (button or static text) inside the webview to exist.
    private func waitForLabelInWebView(_ label: String, timeout: TimeInterval = 15) -> Bool {
        guard webView.waitForExistence(timeout: timeout) else { return false }
        let candidates: [XCUIElement] = [
            webView.buttons[label],
            webView.staticTexts[label],
            webView.links[label],
            webView.otherElements[label]
        ]
        return candidates.contains { $0.waitForExistence(timeout: timeout) }
    }
    
    private func waitForAnyLabel(_ labels: [String], timeout: TimeInterval = 15) -> Bool {
        for label in labels {
            if waitForLabelInWebView(label, timeout: timeout) { return true }
        }
        return false
    }
    
    private func ensureWebContentLoaded() {
        XCTAssertTrue(webView.waitForExistence(timeout: 30), "WebView did not appear")

        // Wait for web content to render
        sleep(5)

        dismissOnboardingIfPresent()

        // Give web app time to fully initialize
        sleep(3)
    }
    
    private func tapNav(_ label: String) {
        XCUIDevice.shared.orientation = .portrait
        guard webView.waitForExistence(timeout: 10) else { return }

        //Try multiple strategies to tap the navigation
        let targetLabel = label.lowercased()

        // Strategy 1: Try finding button by exact label match with press
        let buttonQueries: [(XCUIElementQuery, String)] = [
            (webView.buttons, label),
            (webView.otherElements, label),
            (webView.staticTexts, label)
        ]

        for (query, text) in buttonQueries {
            let element = query[text]
            if element.waitForExistence(timeout: 2) && element.isHittable {
                element.press(forDuration: 0.2)
                sleep(3)
                return
            }
        }

        // Strategy 2: Try coordinate tapping with press instead of tap
        switch targetLabel {
        case "reports", "achievements", "badges":
            let coord = webView.coordinate(withNormalizedOffset: CGVector(dx: 0.12, dy: 0.93))
            coord.press(forDuration: 0.1)
            sleep(1)
        case "coach":
            let coord = webView.coordinate(withNormalizedOffset: CGVector(dx: 0.52, dy: 0.93))
            coord.press(forDuration: 0.1)
            sleep(1)
        case "health", "milestones":
            let coord = webView.coordinate(withNormalizedOffset: CGVector(dx: 0.88, dy: 0.93))
            coord.press(forDuration: 0.1)
            sleep(1)
        case "settings":
            let coord = webView.coordinate(withNormalizedOffset: CGVector(dx: 0.92, dy: 0.08))
            coord.press(forDuration: 0.1)
            sleep(1)
        default:
            break
        }
        sleep(3)
    }

    /// Close onboarding if it sneaks through by completing the entire wizard.
    private func dismissOnboardingIfPresent() {
        // Step 1: Welcome screen - Get Started
        if tapInWebView("Get Started", timeout: 5) {
            snapshot("00_Onboarding_Welcome")
            sleep(2)
        }
        
        // Step 2: First step - tap Continue/Next buttons
        _ = tapInWebView("Continue", timeout: 3)
        sleep(1)
        
        // Step 3: Second step
        _ = tapInWebView("Continue", timeout: 3)
        sleep(1)
        
        // Step 4: Third step
        _ = tapInWebView("Continue", timeout: 3)
        sleep(1)
        
        // Step 5: Fourth step
        _ = tapInWebView("Continue", timeout: 3)
        sleep(1)
        
        // Step 6: Final step - Start My Journey / Get Started / Let's Go
        if !tapInWebView("Start My Journey", timeout: 3) {
            _ = tapInWebView("Let's Go", timeout: 2)
        }
        sleep(2)
        
        // Try once more to close any remaining modals
        _ = tapInWebView("Get Started", timeout: 2)
        _ = tapInWebView("Continue", timeout: 2)
        _ = tapInWebView("Start My Journey", timeout: 2)
        
        // Close any potential alerts
        let alert = app.alerts.firstMatch
        if alert.waitForExistence(timeout: 1) {
            alert.buttons.firstMatch.tap()
        }
    }
    
    /// Open settings via header gear or text.
    private func openSettings() {
        guard webView.waitForExistence(timeout: 10) else { return }
        if tapInWebView("Settings", timeout: 5) { return }
        _ = tapInWebView("⚙", timeout: 3)
        _ = tapInWebView("⚙️", timeout: 3)
        let gearPredicate = NSPredicate(format: "label BEGINSWITH[c] 'Settings'")
        let gearButton = webView.buttons.containing(gearPredicate).firstMatch
        if gearButton.waitForExistence(timeout: 3) {
            _ = tapInWebView(gearButton.label, timeout: 3)
        }
    }
    
    /// Launch the app with a deterministic section so we don't rely on flaky taps.
    private func relaunch(for section: UITestSection?, openSettings: Bool = false) {
        if let section = section {
            app.launchEnvironment["UITEST_SECTION"] = section.rawValue
        } else {
            app.launchEnvironment.removeValue(forKey: "UITEST_SECTION")
        }
        if openSettings {
            app.launchEnvironment["UITEST_OPEN_SETTINGS"] = "1"
        } else {
            app.launchEnvironment.removeValue(forKey: "UITEST_OPEN_SETTINGS")
        }

        app.terminate()
        app.launch()

        XCTAssertTrue(webView.waitForExistence(timeout: 30), "WebView did not appear after relaunch")
        dismissOnboardingIfPresent()
        waitForSectionToStabilize(section: section, openSettings: openSettings)
        XCUIDevice.shared.orientation = .portrait
        sleep(2) // allow final paint to finish
    }

    private func waitForSectionToStabilize(section: UITestSection?, openSettings: Bool) {
        // Just wait for the WebView to be ready, don't assert on specific content
        // This allows screenshots even if the app shows onboarding or unexpected content
        sleep(3)
        
        if openSettings {
            // Try to wait for settings labels but don't fail if not found
            _ = waitForAnyLabel(["Settings", "SmokeFree Pro", "Restore Purchases"], timeout: 10)
            return
        }

        guard let section = section else {
            _ = waitForAnyLabel(["SMOKE FREE", "Log Cigarette", "Next Milestone", "Get Started"], timeout: 10)
            return
        }

        let sectionName = section.rawValue.lowercased()
        switch sectionName {
        case "home":
            _ = waitForAnyLabel(["SMOKE FREE", "Log Cigarette", "Next Milestone", "Get Started"], timeout: 10)
        case "reports":
            _ = waitForAnyLabel(["Daily Cigarettes", "7-Day Trend", "cigarettes per day", "Get Started"], timeout: 10)
        case "achievements":
            _ = waitForAnyLabel(["Your Achievements", "Achievement", "Unlocked", "Get Started"], timeout: 10)
        case "coach":
            _ = waitForAnyLabel(["Your Coach", "Guidance", "Support", "Get Started"], timeout: 10)
        case "cravings":
            _ = waitForAnyLabel(["Cravings", "Pattern Insights", "Track a Craving", "Get Started"], timeout: 10)
        case "milestones":
            _ = waitForAnyLabel(["Health Recovery Timeline", "Milestones", "Your body", "Get Started"], timeout: 10)
        case "quitplan":
            _ = waitForAnyLabel(["Quit Plan", "Timeline", "Health Milestones", "Get Started"], timeout: 10)
        case "settings":
            _ = waitForAnyLabel(["Settings", "SmokeFree Pro", "Restore Purchases", "Get Started"], timeout: 10)
        default:
            sleep(5) // Wait for any section to load
        }
    }
    
    private func capture(_ name: String, section: UITestSection?, openSettings: Bool = false, afterLaunch: (() -> Void)? = nil) {
        relaunch(for: section, openSettings: openSettings)
        afterLaunch?()
        XCUIDevice.shared.orientation = .portrait
        snapshot(name)
    }
    
    func testAppStoreScreenshots() throws {
        // Capture all sections by relaunching with UITEST_SECTION set
        // This captures PRO mode screenshots (uitest_flag enables Pro automatically)
        let sections: [(name: String, section: String)] = [
            ("Pro_01_Home", "home"),
            ("Pro_02_Reports", "reports"),
            ("Pro_03_QuitPlan", "quitPlan"),
            ("Pro_04_Cravings", "cravings"),
            ("Pro_05_Milestones", "milestones"),
            ("Pro_06_Coach", "coach"),
            ("Pro_07_Achievements", "achievements"),
            ("Pro_08_Settings", "settings")
        ]
        
        for (name, section) in sections {
            app.terminate()
            
            // Set environment variables for the section
            app.launchEnvironment["UITEST_SECTION"] = section
            app.launchEnvironment.removeValue(forKey: "UITEST_FREE_MODE") // Pro mode
            if section == "settings" {
                app.launchEnvironment["UITEST_OPEN_SETTINGS"] = "1"
            } else {
                app.launchEnvironment.removeValue(forKey: "UITEST_OPEN_SETTINGS")
            }
            
            app.launch()
            
            // Wait for WebView and app to load
            XCTAssertTrue(webView.waitForExistence(timeout: 30), "WebView did not appear for \(section)")
            
            // Settings needs extra time and explicit tap on gear icon
            if section == "settings" {
                sleep(3)
                let coordinate = app.coordinate(withNormalizedOffset: CGVector(dx: 0.92, dy: 0.06))
                coordinate.tap()
                sleep(5)
            } else {
                sleep(5)
                let coordinate = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.1))
                coordinate.tap()
                sleep(2)
            }
            
            snapshot(name)
        }
    }
    
    func testFreeModeScreenshots() throws {
        // Capture Free mode screenshots with PRO badges visible (gated features)
        let sections: [(name: String, section: String)] = [
            ("Free_01_Home", "home"),
            ("Free_02_Reports", "reports"),
            ("Free_03_QuitPlan", "quitPlan"),
            ("Free_04_Cravings", "cravings"),
            ("Free_05_Milestones", "milestones"),
            ("Free_06_Coach", "coach"),
            ("Free_07_Achievements", "achievements"),
            ("Free_08_Settings", "settings")
        ]
        
        for (name, section) in sections {
            app.terminate()
            
            // Set environment variables for the section
            app.launchEnvironment["UITEST_SECTION"] = section
            app.launchEnvironment["UITEST_FREE_MODE"] = "1" // Force FREE mode
            if section == "settings" {
                app.launchEnvironment["UITEST_OPEN_SETTINGS"] = "1"
            } else {
                app.launchEnvironment.removeValue(forKey: "UITEST_OPEN_SETTINGS")
            }
            
            app.launch()
            
            // Wait for WebView and app to load
            XCTAssertTrue(webView.waitForExistence(timeout: 30), "WebView did not appear for \(section)")
            
            // Settings needs extra time and explicit tap on gear icon
            if section == "settings" {
                sleep(3)
                let coordinate = app.coordinate(withNormalizedOffset: CGVector(dx: 0.92, dy: 0.06))
                coordinate.tap()
                sleep(5)
            } else {
                sleep(5)
                let coordinate = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.1))
                coordinate.tap()
                sleep(2)
            }
            
            snapshot(name)
        }
    }
}
