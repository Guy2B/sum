import Foundation
import Capacitor
import HealthKit

@objc(SigmaHealthPlugin)
public class SigmaHealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SigmaHealthPlugin"
    public let jsName = "SigmaHealth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readSummary", returnType: CAPPluginReturnPromise)
    ]
    private let store = HKHealthStore()

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": HKHealthStore.isHealthDataAvailable(), "platform": "ios"])
    }

    private func readableTypes() -> Set<HKObjectType> {
        var types = Set<HKObjectType>()
        [HKQuantityTypeIdentifier.stepCount, .activeEnergyBurned, .restingHeartRate, .heartRateVariabilitySDNN].forEach {
            if let type = HKObjectType.quantityType(forIdentifier: $0) { types.insert(type) }
        }
        if let sleep = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) { types.insert(sleep) }
        types.insert(HKObjectType.workoutType())
        return types
    }

    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { return call.reject("HealthKit unavailable") }
        store.requestAuthorization(toShare: [], read: readableTypes()) { granted, error in
            if let error = error { return call.reject(error.localizedDescription) }
            call.resolve(["granted": granted, "metrics": ["sleep","steps","activeEnergy","restingHeartRate","hrv","workouts"]])
        }
    }

    private func quantitySum(_ identifier: HKQuantityTypeIdentifier, start: Date, end: Date, unit: HKUnit, completion: @escaping (Double) -> Void) {
        guard let type = HKQuantityType.quantityType(forIdentifier: identifier) else { return completion(0) }
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end)
        let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, _ in
            completion(result?.sumQuantity()?.doubleValue(for: unit) ?? 0)
        }
        store.execute(query)
    }

    private func quantityAverage(_ identifier: HKQuantityTypeIdentifier, start: Date, end: Date, unit: HKUnit, completion: @escaping (Double) -> Void) {
        guard let type = HKQuantityType.quantityType(forIdentifier: identifier) else { return completion(0) }
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end)
        let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .discreteAverage) { _, result, _ in
            completion(result?.averageQuantity()?.doubleValue(for: unit) ?? 0)
        }
        store.execute(query)
    }

    private func sleepHours(start: Date, end: Date, completion: @escaping (Double) -> Void) {
        guard let type = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) else { return completion(0) }
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end)
        let query = HKSampleQuery(sampleType: type, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, _ in
            let seconds = (samples as? [HKCategorySample] ?? []).filter { sample in
                if #available(iOS 16.0, *) { return sample.value == HKCategoryValueSleepAnalysis.asleepCore.rawValue || sample.value == HKCategoryValueSleepAnalysis.asleepDeep.rawValue || sample.value == HKCategoryValueSleepAnalysis.asleepREM.rawValue || sample.value == HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue }
                return sample.value == HKCategoryValueSleepAnalysis.asleep.rawValue
            }.reduce(0) { $0 + $1.endDate.timeIntervalSince($1.startDate) }
            completion(seconds / 3600)
        }
        store.execute(query)
    }

    @objc func readSummary(_ call: CAPPluginCall) {
        let days = max(1, min(30, call.getInt("days") ?? 14))
        let calendar = Calendar.current
        let group = DispatchGroup()
        let lock = NSLock()
        var entries: [[String: Any]] = []
        for offset in 0..<days {
            guard let day = calendar.date(byAdding: .day, value: -offset, to: Date()) else { continue }
            let start = calendar.startOfDay(for: day)
            let end = calendar.date(byAdding: .day, value: 1, to: start)!
            var row: [String: Any] = ["date": ISO8601DateFormatter.sigmaDay.string(from: start)]
            let assign: (String, Double) -> Void = { key, value in lock.lock(); row[key] = value; lock.unlock() }
            group.enter(); quantitySum(.stepCount, start: start, end: end, unit: .count()) { assign("steps", $0); group.leave() }
            group.enter(); quantitySum(.activeEnergyBurned, start: start, end: end, unit: .kilocalorie()) { assign("calories", $0); group.leave() }
            group.enter(); quantityAverage(.restingHeartRate, start: start, end: end, unit: HKUnit.count().unitDivided(by: .minute())) { assign("restingHR", $0); group.leave() }
            group.enter(); quantityAverage(.heartRateVariabilitySDNN, start: start, end: end, unit: .secondUnit(with: .milli)) { assign("hrv", $0); group.leave() }
            group.enter(); sleepHours(start: start, end: end) { assign("sleep", $0); group.leave() }
            group.notify(queue: .global()) { lock.lock(); entries.append(row); lock.unlock() }
        }
        group.notify(queue: .main) { call.resolve(["entries": entries.sorted { String(describing: $0["date"]) > String(describing: $1["date"]) }]) }
    }
}

private extension ISO8601DateFormatter {
    static let sigmaDay: DateFormatter = { let formatter = DateFormatter(); formatter.calendar = Calendar(identifier: .gregorian); formatter.locale = Locale(identifier: "en_US_POSIX"); formatter.dateFormat = "yyyy-MM-dd"; return formatter }()
}
