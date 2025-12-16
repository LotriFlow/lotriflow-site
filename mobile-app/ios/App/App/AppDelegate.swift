import UIKit
import WatchConnectivity
import WebKit
import Capacitor

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        seedUITestOnboardingBypassIfNeeded()
        WatchSessionManager.shared.start()
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        WatchSessionManager.shared.pushSnapshotToWatch()
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(
            application,
            continue: userActivity,
            restorationHandler: restorationHandler
        )
    }

    /// When running UI tests, allow fastlane snapshot to skip onboarding by seeding defaults.
    private func seedUITestOnboardingBypassIfNeeded() {
        let env = ProcessInfo.processInfo.environment
        let defaults = UserDefaults.standard

        // Clear UI test markers when not running UITests to avoid side effects in normal runs.
        guard env["UITEST_SKIP_ONBOARDING"] == "1" else {
            [
                "CapacitorStorage.uitest_flag",
                "CapacitorStorage.uitest_section",
                "CapacitorStorage.uitest_open_settings",
                "CapacitorStorage.uitest_disable_animations",
                "CapacitorStorage.uitest_force_pro",
                "CapacitorStorage.uitest_free_mode"
            ].forEach { defaults.removeObject(forKey: $0) }
            defaults.synchronize()
            return
        }

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
            defaults.set(json, forKey: "CapacitorStorage.lotriflow_smokefree_state")
            defaults.synchronize()

            // UI test helpers for deterministic navigation and visuals
            func setOrRemove(_ key: String, value: String?) {
                if let value = value {
                    defaults.set(value, forKey: key)
                } else {
                    defaults.removeObject(forKey: key)
                }
            }

            defaults.set("1", forKey: "CapacitorStorage.uitest_flag")
            setOrRemove("CapacitorStorage.uitest_section", value: env["UITEST_SECTION"])
            setOrRemove("CapacitorStorage.uitest_open_settings", value: env["UITEST_OPEN_SETTINGS"])
            setOrRemove("CapacitorStorage.uitest_disable_animations", value: env["UITEST_DISABLE_ANIMATIONS"])
            setOrRemove("CapacitorStorage.uitest_force_pro", value: env["UITEST_FORCE_PRO"])
            
            // Debug: print free mode value
            let freeModeValue = env["UITEST_FREE_MODE"]
            print("[AppDelegate] UITEST_FREE_MODE from env:", freeModeValue ?? "nil")
            setOrRemove("CapacitorStorage.uitest_free_mode", value: freeModeValue)
            defaults.synchronize()
        }
    }

}
