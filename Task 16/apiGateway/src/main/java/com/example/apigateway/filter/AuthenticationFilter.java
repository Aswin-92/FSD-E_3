package com.example.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class AuthenticationFilter implements GatewayFilter {
    
    private static final String API_KEY_HEADER = "X-API-Key";
    private static final String VALID_API_KEY = "your-api-key-here";
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        
        // Skip authentication for certain paths
        String path = request.getURI().getPath();
        if (path.startsWith("/public") || path.startsWith("/fallback")) {
            return chain.filter(exchange);
        }
        
        // Check for API key
        List<String> apiKey = request.getHeaders().get(API_KEY_HEADER);
        
        if (apiKey == null || apiKey.isEmpty() || !VALID_API_KEY.equals(apiKey.get(0))) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        
        return chain.filter(exchange);
    }
}