//
//  AppUITests.swift
//  AppUITests
//
//  Created by Christo Lotriet on 12/3/25.
//

import XCTest

final class AppUITests: XCTestCase {

    var app: XCUIApplication!

    @MainActor
    override func setUpWithError() throws {
        continueAfterFailure = false

        app = XCUIApplication()
        setupSnapshot(app)
        app.launchArguments += ["UI_TESTING"]
        app.launch()

        // Wait for app to fully load
        sleep(3)
    }

    override func tearDownWithError() throws {
        // Put teardown code here
    }

    // DISABLED: This test uses native button queries which don't work for Capacitor WebView
    // Use ScreenshotTests.swift -> testAppStoreScreenshots() instead
    /*
    @MainActor
    func testScreenshots() throws {
        // Screenshot 1: Home/Timer Screen
        sleep(2)
        snapshot("01_Timer_Home")

        // Screenshot 2: Milestones/Achievements Tab
        let milestonesTab = app.buttons["Milestones"]
        if milestonesTab.exists {
            milestonesTab.tap()
            sleep(2)
            snapshot("02_Milestones")
        }

        // Screenshot 3: Coach Tab
        let coachTab = app.buttons["Coach"]
        if coachTab.exists {
            coachTab.tap()
            sleep(2)
            snapshot("03_Coach")
        }

        // Screenshot 4: Reports Tab (Pro Feature)
        let reportTab = app.buttons["Report"]
        if reportTab.exists {
            reportTab.tap()
            sleep(2)
            snapshot("04_Report")
        }

        // Screenshot 5: Settings Tab
        let settingsTab = app.buttons["Settings"]
        if settingsTab.exists {
            settingsTab.tap()
            sleep(2)
            snapshot("05_Settings")
        }
    }
    */
}
