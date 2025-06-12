package com.springboot.MyTodoList.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChatStateService {

    private final RedisTemplate<String, Object> redisTemplate;

    public ChatStateService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void saveChatState(long chatId, String state, int tareaId) {
        redisTemplate.opsForValue().set("chat:state:" + chatId, state);
        redisTemplate.opsForValue().set("chat:tareaId:" + chatId, tareaId);
    }

    public void clearChatState(long chatId) {
        redisTemplate.delete("chat:state:" + chatId);
        redisTemplate.delete("chat:tareaId:" + chatId);
        redisTemplate.delete("chat:previousMenu:" + chatId);
    }

    public void savePreviousMenu(long chatId, String menu) {
        redisTemplate.opsForValue().set("chat:previousMenu:" + chatId, menu);
    }

    public String getChatState(long chatId) {
        return (String) redisTemplate.opsForValue().get("chat:state:" + chatId);
    }

    public Integer getTareaId(long chatId) {
        return (Integer) redisTemplate.opsForValue().get("chat:tareaId:" + chatId);
    }

    public String getPreviousMenu(long chatId) {
        return (String) redisTemplate.opsForValue().get("chat:previousMenu:" + chatId);
    }
}
