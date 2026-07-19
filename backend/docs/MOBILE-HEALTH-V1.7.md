# Mobile health integration V1.7

## Delivered

- generated Capacitor iOS and Android projects;
- shared `SigmaHealth` JavaScript contract;
- Swift HealthKit plugin source for availability, permission and daily summaries;
- Android Health Connect reader source;
- Samsung Health SDK integration gate;
- web fallback to explicit demo data when no native bridge exists.

## iOS completion

1. Open `mobile/ios/App/App.xcworkspace` on macOS.
2. Add `native/ios/SigmaHealthPlugin.swift` to the App target.
3. Register the plugin instance in the Capacitor bridge.
4. Enable the HealthKit capability.
5. Add `NSHealthShareUsageDescription` to `Info.plist`.
6. Sign with the final bundle identifier and provisioning profile.
7. Test partial permission, no-data, Apple Watch data delay and deletion.

The Swift source reads step count, active energy, resting heart rate, HRV and sleep summaries. It does not diagnose health conditions.

## Android completion

1. Open `mobile/android` in Android Studio.
2. Add Kotlin and current Health Connect dependencies.
3. copy/register `native/android/SigmaHealthPlugin.kt` and `HealthConnectReader.kt` in the app module;
4. implement the Activity Result permission contract;
5. bridge coroutine results into Capacitor promises;
6. declare only the record permissions actually used;
7. complete Play Console health-data declarations.

## Samsung completion

Samsung's official health-data AAR is not redistributed. Add it from the official SDK, register the production package/signature and replace `SamsungHealthReader` gates with approved DataStore queries. Until this is complete, the interface must show “application/approval required”, not “connected”.
