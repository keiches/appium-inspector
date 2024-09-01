/* eslint-disable */
module.exports = {
  "server": {
    "address": "127.0.0.1",
    "allow-cors": false,
    // "allow-insecure": ["foo", "bar"],
    // "base-path": "/",
    // "base-path": "/wd/hub",
    "callback-address": "127.0.0.1",
    "callback-port": 4723,
    "debug-log-spacing": true,
    /*"default-capabilities": {
      "appium:automationName": "uiautomator2",
      "appium:newCommandTimeout": 240,
    },*/
    // "deny-insecure": ["baz", "quux"],
    /*"driver": {
      /!*"xcuitest": {
        "wdaLocalPort": 8100
      },*!/
      "uiautomator2": {
        "key": "value"
      }
    },*/
    "keep-alive-timeout": 600,
    "local-timezone": true,
    // "log": "/tmp/appium.log",
    "log": "./appium-server.log",
    "log-level": "info",
    "log-format": "text",
    "log-no-colors": true,
    "log-timestamp": false,
    "long-stacktrace": false,
    "no-perms-check": false,
    "plugin": {
      "device-manager": {
        "platform": "android", // "ios",
        "deviceType": "both",
        /*"liveStreaming":true,
        "skipChromeDownload":true,
        "deviceAvailabilityTimeoutMs":300000,
        "deviceAvailabilityQueryIntervalMs":10000,
        "sendNodeDevicesToHubIntervalMs":30000,
        "checkStaleDevicesIntervalMs":30000,
        "checkBlockedDevicesIntervalMs":30000,
        "newCommandTimeoutSec":60,
        "bindHostOrIp":"127.0.0.0"*/
      },
      "element-wait": {
        "timeout": 10000,
        "intervalBetweenAttempts": 500,
        // "excludeEnabledCheck": [],
      }
    },
    "port": 4723,
    "relaxed-security": false,
    "session-override": false,
    "strict-caps": false,
    // "tmp": "/tmp",
    // "trace-dir": "/tmp/appium-instruments",
    "use-drivers": ["uiautomator2"],
    "use-plugins": ["images", "gestures", "device-manager", "element-wait"],
    // "webhook": "https://some-url.com"
  }
};
