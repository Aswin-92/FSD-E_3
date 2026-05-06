package com.example.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class LoggingFilter implements GlobalFilter, Ordered {
    
    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Generate correlation ID
        String correlationId = UUID.randomUUID().toString();
        exchange.getAttributes().put("correlationId", correlationId);
        
        // Log request details
        logger.info("Correlation ID: {}", correlationId);
        logger.info("Request Method: {}, Path: {}", 
            request.getMethod(), request.getURI().getPath());
        logger.info("Request Headers: {}", request.getHeaders());
        
        long startTime = System.currentTimeMillis();
        
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long endTime = System.currentTimeMillis();
            logger.info("Response Status: {}", 
                exchange.getResponse().getStatusCode());
            logger.info("Time Taken: {} ms", (endTime - startTime));
            logger.info("-----------------------------------");
        }));
    }
    
    @Override
    public int getOrder() {
        return -1; // Execute before other filters
    }
}