//
//  LotriFlowQuitWatch_Watch_AppUITests.swift
//  LotriFlowQuitWatch Watch AppUITests
//
//  Created by Christo Lotriet on 12/10/25.
//

import XCTest

final class LotriFlowQuitWatch_Watch_AppUITests: XCTestCase {

    var app: XCUIApplication!

    @MainActor
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        setupSnapshot(app)  // Fastlane snapshot helper
    }

    override func tearDownWithError() throws {
        app = nil
    }

    @MainActor
    func testWatchScreenshots() throws {
        app.launch()

        // Wait for the app to fully load and sync with iPhone
        sleep(5)

        // Capture main screen showing smoke-free timer
        snapshot("Watch_01_Timer")

        // Scroll down to see more content if needed
        sleep(1)

        // Capture again after a moment (in case there are updates)
        snapshot("Watch_02_Stats")
    }
}
