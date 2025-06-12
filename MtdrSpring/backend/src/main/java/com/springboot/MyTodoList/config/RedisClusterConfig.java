// RedisClusterConfig.java
package com.springboot.MyTodoList.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisClusterConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import redis.clients.jedis.JedisPoolConfig;

import java.util.Arrays;
import java.util.List;

@Configuration
public class RedisClusterConfig {

    @Value("${spring.redis.cluster.nodes}")
    private String clusterNodes;

    @Value("${spring.redis.cluster.max-redirects:3}")
    private int maxRedirects;

    @Value("${spring.redis.timeout:2000}")
    private int timeout;

    @Value("${spring.redis.password:}")
    private String password;

    @Bean
    public RedisClusterConfiguration redisClusterConfiguration() {
        RedisClusterConfiguration clusterConfig = new RedisClusterConfiguration();
        
        // Parse cluster nodes
        List<String> nodes = Arrays.asList(clusterNodes.split(","));
        clusterConfig.setClusterNodes(nodes.stream()
            .map(node -> {
                String[] parts = node.trim().split(":");
                return new org.springframework.data.redis.connection.RedisNode(
                    parts[0], 
                    parts.length > 1 ? Integer.parseInt(parts[1]) : 6379
                );
            })
            .collect(java.util.stream.Collectors.toList()));
        
        clusterConfig.setMaxRedirects(maxRedirects);
        
        if (!password.isEmpty()) {
            clusterConfig.setPassword(password);
        }
        
        return clusterConfig;
    }

    @Bean
    public JedisPoolConfig jedisPoolConfig() {
        JedisPoolConfig poolConfig = new JedisPoolConfig();
        poolConfig.setMaxTotal(20);
        poolConfig.setMaxIdle(10);
        poolConfig.setMinIdle(2);
        poolConfig.setTestOnBorrow(true);
        poolConfig.setTestOnReturn(true);
        poolConfig.setTestWhileIdle(true);
        poolConfig.setBlockWhenExhausted(true);
        return poolConfig;
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory(
            RedisClusterConfiguration redisClusterConfiguration,
            JedisPoolConfig jedisPoolConfig) {
        
        JedisConnectionFactory factory = new JedisConnectionFactory(
            redisClusterConfiguration, jedisPoolConfig);
        factory.setTimeout(timeout);
        return factory;
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // Use JSON serializer for values
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        template.setDefaultSerializer(new GenericJackson2JsonRedisSerializer());
        template.afterPropertiesSet();
        
        return template;
    }
}