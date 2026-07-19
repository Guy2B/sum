package com.algbr.sigma.health

import android.content.Context

/**
 * Integration point for Samsung Health Data SDK v1.1+.
 * Add samsung-health-data-api.aar from Samsung's official SDK to the Android project,
 * register the distributed app with Samsung, then replace these gates with DataStore queries
 * for StepsType, SleepType, HeartRateType, ActivitySummaryType and EnergyScoreType.
 */
object SamsungHealthReader {
    fun isAvailable(context: Context): Boolean = try {
        Class.forName("com.samsung.android.sdk.health.data.HealthDataService")
        true
    } catch (_: Throwable) { false }
}
