package com.petrotwin;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("local")
class ApplicationTests {

    @Test
    void contextLoads() {
        // Verifies that the Spring application context boots and Flyway migrations execute successfully
    }
}
