import Foundation
import Capacitor
import WatchConnectivity

/// Sends watch actions into the JS layer.
@objc(WatchBridgePlugin)
public class WatchBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "WatchBridgePlugin"
    public let jsName = "WatchBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkWatchApp", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "forceInstallWatchApp", returnType: CAPPluginReturnPromise)
    ]

    static weak var shared: WatchBridgePlugin?

    public override func load() {
        WatchBridgePlugin.shared = self
        WatchSessionManager.shared.bridge = bridge
    }

    func notifyAction(_ type: String) {
        notifyListeners("watchAction", data: ["type": type])
    }

    @objc func checkWatchApp(_ call: CAPPluginCall) {
        guard WCSession.isSupported() else {
            call.resolve(["supported": false, "installed": false])
            return
        }

        let session = WCSession.default
        let isPaired = session.isPaired
        let isWatchAppInstalled = session.isWatchAppInstalled
        let isReachable = session.isReachable

        call.resolve([
            "supported": true,
            "paired": isPaired,
            "installed": isWatchAppInstalled,
            "reachable": isReachable
        ])
    }

    @objc func forceInstallWatchApp(_ call: CAPPluginCall) {
        guard WCSession.isSupported() else {
            call.reject("Watch Connectivity not supported")
            return
        }

        let session = WCSession.default
        if !session.isPaired {
            call.reject("No Apple Watch paired")
            return
        }

        // Activate session to trigger app installation
        session.delegate = WatchSessionManager.shared
        session.activate()

        // Send a message to trigger installation
        WatchSessionManager.shared.pushSnapshotToWatch()

        // Check status after a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            call.resolve([
                "success": true,
                "installed": session.isWatchAppInstalled,
                "message": session.isWatchAppInstalled ?
                    "Watch app is installed" :
                    "Watch app installation triggered. Please check your Watch in Settings > App Store > Automatic App Install"
            ])
        }
    }
}
