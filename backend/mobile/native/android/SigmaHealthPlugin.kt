package com.algbr.sigma.health

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Capacitor facade. HealthConnectReader is the production implementation.
 * SamsungHealthReader is selected when the Samsung partner SDK AAR is installed and enabled.
 */
@CapacitorPlugin(name = "SigmaHealth")
class SigmaHealthPlugin : Plugin() {
    @PluginMethod
    fun isAvailable(call: PluginCall) {
        val provider = call.getString("provider", "health-connect")
        val result = JSObject()
        result.put("platform", "android")
        result.put("available", HealthConnectReader.isAvailable(context) || (provider == "samsung" && SamsungHealthReader.isAvailable(context)))
        call.resolve(result)
    }

    @PluginMethod
    fun requestAuthorization(call: PluginCall) {
        // The host Activity must launch the Health Connect permission contract or Samsung consent UI.
        // Keep this method asynchronous in the production Android Studio project.
        val provider = call.getString("provider", "health-connect")
        val result = JSObject()
        result.put("granted", false)
        result.put("provider", provider)
        result.put("requiresNativePermissionFlow", true)
        call.resolve(result)
    }

    @PluginMethod
    fun readSummary(call: PluginCall) {
        val result = JSObject()
        result.put("entries", JSArray())
        result.put("requiresNativeCoroutineBridge", true)
        call.resolve(result)
    }
}
