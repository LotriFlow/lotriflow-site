//
//  SmokeFreeWidget.swift
//  SmokeFreeWidget
//
//  Created by SmokeFree App
//

import WidgetKit
import SwiftUI

// MARK: - Timeline Provider
struct SmokeFreeProvider: TimelineProvider {
    
    // App Group identifier - must match the one in Capacitor app
    let appGroupID = "group.com.lotriflow.smokefree"
    
    func placeholder(in context: Context) -> SmokeFreeEntry {
        SmokeFreeEntry(
            date: Date(),
            smokeFreeTime: "Loading...",
            cigarettesAvoided: 0,
            moneySaved: "$0.00",
            streak: 0
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (SmokeFreeEntry) -> Void) {
        let entry = loadEntry()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SmokeFreeEntry>) -> Void) {
        let entry = loadEntry()
        
        // Update every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func loadEntry() -> SmokeFreeEntry {
        guard let defaults = UserDefaults(suiteName: appGroupID) else {
            return SmokeFreeEntry(date: Date(), smokeFreeTime: "No data", cigarettesAvoided: 0, moneySaved: "$0.00", streak: 0)
        }
        
        // Read data shared from the Capacitor app
        let lastCigaretteTimestamp = defaults.double(forKey: "lastCigarette")
        let cigarettesAvoided = defaults.integer(forKey: "cigarettesAvoided")
        let moneySaved = defaults.double(forKey: "moneySaved")
        let streak = defaults.integer(forKey: "streak")
        let currencySymbol = defaults.string(forKey: "currencySymbol") ?? "$"
        
        // Calculate smoke-free time
        var smokeFreeTime = "Start tracking!"
        if lastCigaretteTimestamp > 0 {
            let lastCigarette = Date(timeIntervalSince1970: lastCigaretteTimestamp / 1000)
            smokeFreeTime = formatDuration(from: lastCigarette, to: Date())
        }
        
        let formattedMoney = String(format: "%@%.2f", currencySymbol, moneySaved)
        
        return SmokeFreeEntry(
            date: Date(),
            smokeFreeTime: smokeFreeTime,
            cigarettesAvoided: cigarettesAvoided,
            moneySaved: formattedMoney,
            streak: streak
        )
    }
    
    private func formatDuration(from startDate: Date, to endDate: Date) -> String {
        let interval = endDate.timeIntervalSince(startDate)
        
        let days = Int(interval) / 86400
        let hours = (Int(interval) % 86400) / 3600
        let minutes = (Int(interval) % 3600) / 60
        
        if days > 0 {
            return "\(days)d \(hours)h"
        } else if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            return "\(minutes)m"
        }
    }
}

// MARK: - Timeline Entry
struct SmokeFreeEntry: TimelineEntry {
    let date: Date
    let smokeFreeTime: String
    let cigarettesAvoided: Int
    let moneySaved: String
    let streak: Int
}

// MARK: - Widget Views

// Small Widget
struct SmokeFreeWidgetSmallView: View {
    var entry: SmokeFreeProvider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: "lungs.fill")
                    .foregroundColor(.green)
                Text("SmokeFree")
                    .font(.caption)
                    .fontWeight(.semibold)
            }
            
            Spacer()
            
            Text(entry.smokeFreeTime)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text("smoke-free")
                .font(.caption2)
                .foregroundColor(.secondary)
            
            Spacer()
            
            HStack {
                Label("\(entry.streak)", systemImage: "flame.fill")
                    .font(.caption2)
                    .foregroundColor(.orange)
            }
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

// Medium Widget
struct SmokeFreeWidgetMediumView: View {
    var entry: SmokeFreeProvider.Entry
    
    var body: some View {
        HStack(spacing: 16) {
            // Left side - Time
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: "lungs.fill")
                        .foregroundColor(.green)
                    Text("SmokeFree")
                        .font(.caption)
                        .fontWeight(.semibold)
                }
                
                Spacer()
                
                Text(entry.smokeFreeTime)
                    .font(.title)
                    .fontWeight(.bold)
                
                Text("smoke-free")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
            }
            
            Divider()
            
            // Right side - Stats
            VStack(alignment: .leading, spacing: 12) {
                StatRow(icon: "nosign", iconColor: .red, value: "\(entry.cigarettesAvoided)", label: "avoided")
                StatRow(icon: "dollarsign.circle.fill", iconColor: .green, value: entry.moneySaved, label: "saved")
                StatRow(icon: "flame.fill", iconColor: .orange, value: "\(entry.streak)", label: "day streak")
            }
        }
        .padding()
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct StatRow: View {
    let icon: String
    let iconColor: Color
    let value: String
    let label: String
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .foregroundColor(iconColor)
                .frame(width: 20)
            
            VStack(alignment: .leading, spacing: 0) {
                Text(value)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Text(label)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// MARK: - Widget Configuration
struct SmokeFreeWidget: Widget {
    let kind: String = "SmokeFreeWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SmokeFreeProvider()) { entry in
            SmokeFreeWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("SmokeFree Progress")
        .description("Track your smoke-free journey at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct SmokeFreeWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: SmokeFreeProvider.Entry
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmokeFreeWidgetSmallView(entry: entry)
        case .systemMedium:
            SmokeFreeWidgetMediumView(entry: entry)
        default:
            SmokeFreeWidgetSmallView(entry: entry)
        }
    }
}

// MARK: - Widget Bundle (if you have multiple widgets)
@main
struct SmokeFreeWidgetBundle: WidgetBundle {
    var body: some Widget {
        SmokeFreeWidget()
    }
}

// MARK: - Preview
#Preview(as: .systemSmall) {
    SmokeFreeWidget()
} timeline: {
    SmokeFreeEntry(date: .now, smokeFreeTime: "2d 5h", cigarettesAvoided: 42, moneySaved: "$15.50", streak: 3)
}

#Preview(as: .systemMedium) {
    SmokeFreeWidget()
} timeline: {
    SmokeFreeEntry(date: .now, smokeFreeTime: "2d 5h", cigarettesAvoided: 42, moneySaved: "$15.50", streak: 3)
}
