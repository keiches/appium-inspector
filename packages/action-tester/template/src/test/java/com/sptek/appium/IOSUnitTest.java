package com.sptek.appium;

import io.appium.java_client.ios.IOSDriver;
import io.appium.java_client.ios.options.XCUITestOptions;
import kong.unirest.core.HttpResponse;
import kong.unirest.core.JsonNode;
import kong.unirest.core.Unirest;
import org.junit.jupiter.api.*;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.remote.RemoteWebDriver;
// import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileWriter;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.UUID;

// @DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
@DisplayName("Appium App Validator - JUnit 5 Unit Test")
public class IOSUnitTest {
    // private static final org.slf4j.Logger log = LoggerFactory.getLogger(IOSUnitTest.class);
    private static final org.slf4j.Logger log = LoggerFactory.getLogger("");
    private String reportDirectory = "reports";
    private String reportFormat = "xml";
    private String testName = "Appium App Validator - JUnit 5 Unit Test";

    protected IOSDriver driver = null;
    XCUITestOptions options = new XCUITestOptions();

    private URL getURL() {
        try {
            // System.out.println("URL #1: " + URI.create("{{serverAddress}}").toURL().toString());
            log.debug("URL #2: {}", URI.create("{{serverAddress}}").toURL().toString());
            return URI.create("{{serverAddress}}").toURL();
            // return Paths.get("{{serverAddress}}"); // .toUri().toURL();
            // return new URL("{{serverAddress}}"); // "http://localhost:4723"
        } catch (MalformedURLException e) {
            // e.printStackTrace();
            // System.out.println("Error creating URL1 " + e.toString());
            log.error("Error creating URL", e);
        }
        return null;
    }

    public String getSessionId(IOSDriver driver) {
        String sessionId;
        try {
            sessionId = driver.getSessionId().toString();
        } catch (Exception e){
            sessionId = UUID.randomUUID().toString();
        }
        return sessionId;
    }

    // appium-reporter-plugin
    public static void setTestInfo(String sessionId, String testName, String testStatus, String error) {
        try {
            String url = "{{testerAddress}}/setTestInfo";
            String body = "{" +
                    "\"sessionId\":\""+sessionId+"\"," +
                    "\"testName\":\""+testName+"\"," +
                    "\"testStatus\":\""+testStatus+"\"," +
                    "\"error\":\""+error+"\"" +
                    "}";
            System.out.println("url = " + url);
            System.out.println("Body of setTestInfo = " + body);
            HttpResponse<JsonNode> jsonNodeHttpResponse = Unirest.post(url)
                    .header("Content-Type", "application/json")
                    .body(body).asJson();
        } catch (Exception e) {
            // e.printStackTrace();
            System.out.println("Failed to set Test info1");
            log.error("Error set Test Info2", e);
        }
    }

    // appium-reporter-plugin
    public String getReport() throws IOException, InterruptedException {
        String url = "{{testerAddress}}/getReport";
        String report = Unirest.get(url).asString().getBody();
        System.out.println("received report = " + report);
        return report;
    }

    // appium-reporter-plugin
    public void deleteReportData() throws IOException, InterruptedException {
        String url = "{{testerAddress}}/deleteReportData";
        Unirest.delete(url).asEmpty();
        System.out.println("report data deleted done!");
    }

    // appium-reporter-plugin
    public void createReportFile(String data, String fileName) throws IOException {
        FileWriter fileWriter = new FileWriter(System.getProperty("user.dir") + "/" + fileName + ".html");
        fileWriter.write(data);
        fileWriter.close();
    }

    // appium-reporter-plugin
    public void saveReportFile() throws Exception {
        String report = getReport();
        deleteReportData();
        createReportFile(report, "report");
    }

    private void initLoggers() throws IOException {
        Logger thisLogger = Logger.getLogger("");
        thisLogger.setLevel(Level.ALL);
        Arrays.stream(thisLogger.getHandlers()).forEach(handler -> {
            handler.setLevel(Level.FINE);
        });
        thisLogger.addHandler(new FileHandler("global_logs.xml"));
        /*Logger selfLogger = Logger.getLogger(AndroidUnitTest.class.getName()); // this.getClass().getName());
        selfLogger.setLevel(Level.ALL);
        // Handler handler = new FileHandler("appium_logs.xml");
        // driverLogger.addHandler(handler);
        selfLogger.addHandler(new FileHandler("client_logs.xml"));*/
        /*Logger localLogger = Logger.getLogger(this.getClass().getName());
        localLogger.setLevel(Level.ALL);
        localLogger.addHandler(new FileHandler("local_logs.xml"));*/
        Logger driverLogger = Logger.getLogger(RemoteWebDriver.class.getName()); // this.getClass().getName());
        driverLogger.setLevel(Level.ALL);
        // Handler handler = new FileHandler("appium_logs.xml");
        // driverLogger.addHandler(handler);
        driverLogger.addHandler(new FileHandler("server_logs.xml"));
        /*Logger seleniumLogger = Logger.getLogger(SeleniumManager.class.getName()); // this.getClass().getName());
        seleniumLogger.setLevel(Level.ALL);
        // Handler handler = new FileHandler("selenium_logs.xml");
        // seleniumLogger.addHandler(handler);
        seleniumLogger.addHandler(new FileHandler("selenium_logs.xml"));*/
    }

    @BeforeEach
    public void beforeEach() throws MalformedURLException {
        log.info("Starting Appium App Validator for iOS...");

        System.out.println("Setting up Appium capabilities...");
        try {
            // Capabilities
            // NOTE: already includes in XCUITestOptions
            // options.setPlatformName("iOS"); // optional
            // options.setAutomationName(AutomationName.IOS_XCUI_TEST); // optional
            options.setDeviceName("{{capabilities.deviceName}}"); // "iPhone 15 Pro Max");
            /// options.setUdid("{{capabilities.uuid}}");
            options.setPlatformVersion("{{capabilities.platformVersion}}"); // "17.5");
            // options.setApp(System.getProperty("user.dir") + "/apps/iOS-Simulator-MyRNDemoApp.1.3.0-162.zip");
            // options.setApp("/Users/keiches/Projects/SPTek/ppium-app-validator\\apps\\iOS-Simulator-MyRNDemoApp.1.3.0-162.zip");
            options.setApp("{{capabilities.app}}");
            // Additions
            options.setCapability("reportDirectory", reportDirectory);
            options.setCapability("reportFormat", reportFormat);
            options.setCapability("testName", testName);
            options.setCapability("includeSafariInWebviews", true); // TODO:
            options.setCapability("newCommandTimeout", 3600); // TODO:
            options.setCapability("connectHardwareKeyboard", true); // TODO:
            // options.setCapability("noReset", false);

            driver = new IOSDriver(Objects.requireNonNull(getURL()), options);
            driver.setLogLevel(Level.INFO);
            driver.addSyslogConnectionListener(new Runnable() {
                public void run() {
                    System.out.println("[iOS]------");
                }
            });
            // @site: https://github.com/SeleniumHQ/seleniumhq.github.io/blob/trunk//examples/java/src/test/java/dev/selenium/troubleshooting/LoggingTest.java#L40-L41
            System.out.println("--- session(" + driver.getSessionId() + ") ready!");
            initLoggers();
            // Thread.sleep(4000);
            // driver.findElements(AppiumBy.name("store item text")).get(0).click();
        } catch (MalformedURLException e) {
            System.out.println("ERROR: failed to set up Appium capabilities: " + e.getMessage());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @AfterEach
    public void afterEach() {
        try {
            if (driver != null && driver.getSessionId() != null) {
                System.out.println("Shut Appium test session(" + getSessionId(driver) + ") down!");
                driver.quit();
                driver = null;
            } else {
                System.out.println("Warning: Appium test session id was not exist!");
            }
        } catch (Exception e) {
            System.out.println("ERROR: failed to shut down Appium test: " + e.getMessage());
        }
    }

    @BeforeAll
    static void beforeAll() {
        System.out.println("BEFORE ALL");
    }

    @AfterAll
    static void afterAll() {
        System.out.println("AFTER ALL");
    }

    @Test
    @DisplayName("Main")
    @Order(1)
    public void testMain() throws Exception {
        try {
            {{codes}}
        } catch (Exception e) {
            System.out.println("ERROR: failed to testMain: " + e.getMessage());
        }
    }
}
