import UIKit
import Capacitor

class CustomBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        // Register custom plugins using the official API
        bridge?.registerPluginInstance(WatchBridgePlugin())
        NSLog("[CustomBridgeViewController] ✅ Custom plugins registered")
    }
}
