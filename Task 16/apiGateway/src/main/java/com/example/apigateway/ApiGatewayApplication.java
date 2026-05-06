package com.example.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ApiGatewayApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
        System.out.println("=".repeat(50));
        System.out.println("API Gateway Started Successfully!");
        System.out.println("Access the gateway at: http://localhost:8080");
        System.out.println("Dashboard: http://localhost:8080");
        System.out.println("=".repeat(50));
    }
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            .route("user-service", r -> r
                .path("/api/users/**")
                .uri("http://localhost:8081"))
            .route("order-service", r -> r
                .path("/api/orders/**")
                .uri("http://localhost:8082"))
            .route("product-service", r -> r
                .path("/api/products/**")
                .uri("http://localhost:8083"))
            .build();
    }
}