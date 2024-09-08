package com.sptek.appium;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.encoder.PatternLayoutEncoder;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.rolling.RollingFileAppender;
import ch.qos.logback.core.rolling.TimeBasedRollingPolicy;

public class Logger {
    private static final Logger logger = LoggerFactory.getLogger(""); // 루트 로거 가져오기

    public void configureLogger() {
        LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();

        // 기존 핸들러 제거 (선택 사항): 기존 핸들러를 유지하고 싶지 않다면 주석 처리
        // ch.qos.logback.classic.Logger rootLogger = loggerContext.getLogger(Logger.ROOT_LOGGER_NAME);
        // for (ch.qos.logback.core.Appender<ILoggingEvent> appender : rootLogger.iteratorForAppenders()) {
        //     rootLogger.detachAppender(appender);
        // }

        // 패턴 설정
        PatternLayoutEncoder encoder = new PatternLayoutEncoder();
        encoder.setPattern("%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n");
        encoder.setContext(loggerContext);
        encoder.start();

        // RollingFileAppender 설정
        RollingFileAppender<ILoggingEvent> fileAppender = new RollingFileAppender<>();
        fileAppender.setFile("global_logs.xml"); // 파일 이름 설정

        // Rolling 정책 설정 (선택 사항): 필요에 따라 설정
        TimeBasedRollingPolicy<ILoggingEvent> rollingPolicy = new TimeBasedRollingPolicy<>();
        rollingPolicy.setFileNamePattern("global_logs.%d{yyyy-MM-dd}.xml");
        rollingPolicy.setMaxHistory(30); // 로그 파일 보관 기간 설정
        rollingPolicy.setParent(fileAppender);
        rollingPolicy.start();

        fileAppender.setEncoder(encoder);
        fileAppender.setRollingPolicy(rollingPolicy);
        fileAppender.setContext(loggerContext);
        fileAppender.start();

        // 루트 로거에 FileAppender 추가
        ch.qos.logback.classic.Logger rootLogger = loggerContext.getLogger(Logger.ROOT_LOGGER_NAME);
        rootLogger.setLevel(Level.ALL); // 루트 로거 레벨 설정
        rootLogger.addAppender(fileAppender);
    }
}
