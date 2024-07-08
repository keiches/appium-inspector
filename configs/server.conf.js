/* eslint-disable */
module.exports = {
  "server": {
    "address": "127.0.0.1",
    "allow-cors": false,
    // "allow-insecure": ["foo", "bar"],
    "base-path": "/",
    "callback-address": "127.0.0.1",
    "callback-port": 4723,
    "debug-log-spacing": true,
    "default-capabilities": {
      "key": "value"
    },
    // "deny-insecure": ["baz", "quux"],
    "driver": {
      /*"xcuitest": {
        "key": "value"
      },*/
      "uiautomator2": {
        "key": "value"
      }
    },
    "keep-alive-timeout": 600,
    "local-timezone": true,
    "log": "/tmp/appium.log",
    "log-level": "info",
    "log-format": "text",
    "log-no-colors": true,
    "log-timestamp": false,
    "long-stacktrace": false,
    "no-perms-check": false,
    "plugin": {
      "device-farm": {
        "platform": "android",
        "androidDeviceType": "both",
        // "androidDeviceType": "real",
        "iosDeviceType": "both"
        // "iosDeviceType": "simulated",
      },
      "element-wait": {
        "timeout": 10000,
        "intervalBetweenAttempts": 500,
        "excludeEnabledCheck": [],
      }
    },
    "port": 4723,
    "relaxed-security": false,
    "session-override": false,
    "strict-caps": false,
    // "tmp": "/tmp",
    // "trace-dir": "/tmp/appium-instruments",
    "use-drivers": ["uiautomator2"],
    // "use-plugins": ["baz", "quux"],
    "webhook": "https://some-url.com"
  }
};
