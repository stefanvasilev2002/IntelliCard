package com.finki.intellicard;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class IntelliCardApplication {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.load();
		System.setProperty("OPENAI_API_KEY", dotenv.get("OPENAI_API_KEY"));
        SpringApplication.run(IntelliCardApplication.class, args);
    }

}
