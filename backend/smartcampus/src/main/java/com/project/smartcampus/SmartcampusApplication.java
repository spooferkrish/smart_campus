package com.project.smartcampus;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class SmartcampusApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        setSystemPropertyIfPresent(dotenv, "DB_PASSWORD");
        setSystemPropertyIfPresent(dotenv, "DB_USERNAME");
        setSystemPropertyIfPresent(dotenv, "DB_URL");

        // Required for Spring OAuth2 Google client registration placeholders.
        setSystemPropertyIfPresent(dotenv, "GOOGLE_CLIENT_ID");
        setSystemPropertyIfPresent(dotenv, "GOOGLE_CLIENT_SECRET");

        // Keep other placeholders aligned with .env when present.
        setSystemPropertyIfPresent(dotenv, "FRONTEND_URL");
        setSystemPropertyIfPresent(dotenv, "JWT_SECRET");
        setSystemPropertyIfPresent(dotenv, "JWT_EXPIRATION");

        SpringApplication.run(SmartcampusApplication.class, args);
    }

    private static void setSystemPropertyIfPresent(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value != null && !value.isBlank()) {
            System.setProperty(key, value);
        }
    }
}