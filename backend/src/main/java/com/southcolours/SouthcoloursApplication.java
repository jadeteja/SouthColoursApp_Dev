package com.southcolours;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class SouthcoloursApplication {

    public static void main(String[] args) {
        SpringApplication.run(SouthcoloursApplication.class, args);
    }
}
