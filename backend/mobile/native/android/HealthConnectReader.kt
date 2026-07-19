package com.algbr.sigma.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.aggregate.AggregateRequest
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant

object HealthConnectReader {
    fun isAvailable(context: Context): Boolean = HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE
    suspend fun readSteps(context: Context, start: Instant, end: Instant): Long {
        val client = HealthConnectClient.getOrCreate(context)
        val response = client.aggregate(AggregateRequest(setOf(StepsRecord.COUNT_TOTAL), TimeRangeFilter.between(start, end)))
        return response[StepsRecord.COUNT_TOTAL] ?: 0L
    }
}
