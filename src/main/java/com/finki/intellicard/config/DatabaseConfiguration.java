package com.finki.intellicard.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;

import java.io.File;

@Configuration
@Profile("desktop")
@Order(1)
public class DatabaseConfiguration {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @PostConstruct
    public void ensureDatabaseDirectoryExists() {
        try {
            String dbPath = extractDatabasePath(datasourceUrl);

            if (dbPath != null) {
                File dbFile = new File(dbPath);
                File parentDir = dbFile.getParentFile();

                if (parentDir != null && !parentDir.exists()) {
                    boolean created = parentDir.mkdirs();
                    if (created) {
                        System.out.println("✅ Created database directory: " + parentDir.getAbsolutePath());
                    } else {
                        System.err.println("❌ Failed to create database directory: " + parentDir.getAbsolutePath());
                        throw new RuntimeException("Could not create database directory: " + parentDir.getAbsolutePath());
                    }
                } else if (parentDir != null) {
                    System.out.println("✅ Database directory already exists: " + parentDir.getAbsolutePath());
                }

                if (!dbFile.exists()) {
                    try {
                        boolean fileCreated = dbFile.createNewFile();
                        if (fileCreated) {
                            System.out.println("✅ Created database file: " + dbFile.getAbsolutePath());
                        }
                        dbFile.delete();
                    } catch (Exception e) {
                        System.err.println("❌ Cannot create database file: " + e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error ensuring database directory exists: " + e.getMessage());
            throw new RuntimeException("Database initialization failed", e);
        }
    }

    private String extractDatabasePath(String jdbcUrl) {
        if (jdbcUrl != null && jdbcUrl.startsWith("jdbc:sqlite:")) {
            String path = jdbcUrl.substring("jdbc:sqlite:".length());

            if (path.contains("${user.home}")) {
                path = path.replace("${user.home}", System.getProperty("user.home"));
            }

            return path.replace("/", File.separator);
        }
        return null;
    }
}