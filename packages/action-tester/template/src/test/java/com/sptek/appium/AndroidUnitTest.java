package com.sptek.appium;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import kong.unirest.core.HttpResponse;
import kong.unirest.core.JsonNode;
import kong.unirest.core.Unirest;
import org.junit.jupiter.api.*;
import org.openqa.selenium.manager.SeleniumManager;
import org.openqa.selenium.remote.RemoteWebDriver;
// import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// import org.slf4j.bridge.SLF4JBridgeHandler;

import java.io.FileWriter;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;
// import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Objects;
import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.UUID;

// @DisplayNameGeneration(DisplayNameGenerator.ReplaceUnderscores.class)
@DisplayName("Appium App Validator - JUnit 5 Unit Test")
public class AndroidUnitTest {
    // private static final org.slf4j.Logger log = LoggerFactory.getLogger(AndroidUnitTest.class);
    private static final org.slf4j.Logger log = LoggerFactory.getLogger("");
    private String reportDirectory = "reports";
    private String reportFormat = "xml";
    private String testName = "Appium App Validator - JUnit 5 Unit Test";

    protected AndroidDriver driver = null;

    UiAutomator2Options options = new UiAutomator2Options();

    /*
    // NOTE: Additional initializing
    static {
        SLF4JBridgeHandler.removeHandlersForRootLogger();
        SLF4JBridgeHandler.install();
    }*/

    private URL getURL() {
        try {
            // System.out.println("URL #1: " + URI.create("{{remoteAddress}}").toURL().toString());
            log.debug("URL #2: {}", URI.create("{{remoteAddress}}").toURL().toString());
            return URI.create("{{remoteAddress}}").toURL();
            // return Paths.get("{{remoteAddress}}"); // .toUri().toURL();
            // return new URL("{{remoteAddress}}");
        } catch (MalformedURLException e) {
            // e.printStackTrace();
            // System.out.println("Error creating URL1 " + e.toString());
            log.error("Error creating URL", e);
        }
        return null;
    }

    public String getSessionId(AndroidDriver driver) {
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
            String url = "{{remoteAddress}}/setTestInfo";
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
        String url = "{{remoteAddress}}/getReport";
        String report = Unirest.get(url).asString().getBody();
        System.out.println("received report = " + report);
        return report;
    }

    // appium-reporter-plugin
    public void deleteReportData() throws IOException, InterruptedException {
        String url = "{{remoteAddress}}/deleteReportData";
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
        log.info("Setting up Appium App Validator!");

        System.out.println("Setting up Appium capabilities...");
        try {
            /* FormatStrategy formatStrategy = PrettyFormatStrategy.newBuilder()
                    .showThreadInfo(false)  // (Optional) Whether to show thread info or not. Default true
                    .methodCount(0)         // (Optional) How many method line to show. Default 2
                    .methodOffset(3)        // (Optional) Skips some method invokes in stack trace. Default 5
                    //.logStrategy(customLog) // (Optional) Changes the log strategy to print out. Default LogCat
                    .tag("My custom tag")   // (Optional) Custom tag for each log. Default PRETTY_LOGGER
                    .build();

            Logger.addLogAdapter(new AndroidLogAdapter(formatStrategy)); */

            // Create LogManager object
            /*LogManager logManager
                    = LogManager.getLogManager();

            Enumeration<String> listOfNames
                    = logManager.getLoggerNames();

            System.out.println("Earlier List of Logger Names: ");
            while (listOfNames.hasMoreElements())
                System.out.println(listOfNames.nextElement());

            String LoggerName = "GFG";

            Logger logger = Logger.getLogger(LoggerName);

            logger.addHandler(new FileHandler("appium_logs.xml"));
            System.out.println("Adding Logger: " + LoggerName);
            logManager.addLogger(logger);*/

            // Capabilities
            options.setCapability("reportDirectory", reportDirectory);
            options.setCapability("reportFormat", reportFormat);
            options.setCapability("testName", testName);
            // NOTE: already includes in UiAutomator2Options
            // options.setPlatformName("Android"); // optional
            // options.setAutomationName(AutomationName.ANDROID_UIAUTOMATOR2); // optional
            options.setDeviceName("{{capabilities.deviceName}}"); // "emulator-5554");
            options.setPlatformVersion("{{capabilities.platformVersion}}"); // "12.0");
            // options.setApp(System.getProperty("user.dir") + "/apps/Android-MyDemoAppRN.1.3.0.build-244.apk");
            options.setApp("{{capabilities.app}}"); // "C:\\Users\\keiches\\Projects\\sptek\\appium-app-validator\\apks\\Android-MyDemoAppRN.1.3.0.build-244.apk");
            options.setAppPackage("{{capabilities.appPackage}}"); // "com.saucelabs.mydemoapp.rn");
            options.setAppActivity("{{capabilities.appActivity}}"); // ".MainActivity");

            driver = new AndroidDriver(Objects.requireNonNull(getURL()), options); // "{{remoteAddress}}"), options);
            driver.setLogLevel(Level.INFO);
            driver.addLogcatConnectionListener(new Runnable() {
               public void run() {
                   System.out.println("------");
               }
           });
            // @site: https://github.com/SeleniumHQ/seleniumhq.github.io/blob/trunk//examples/java/src/test/java/dev/selenium/troubleshooting/LoggingTest.java#L40-L41
            System.out.println("--- session(" + driver.getSessionId() + ") ready!");
            initLoggers();
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
