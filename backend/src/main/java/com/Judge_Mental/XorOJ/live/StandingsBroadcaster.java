package com.Judge_Mental.XorOJ.live;

import com.Judge_Mental.XorOJ.dto.StandingsEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class StandingsBroadcaster {

    private final ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter register(Long contestId) {
        var emitter = new SseEmitter(Duration.ofMinutes(30).toMillis());
        emitters.computeIfAbsent(contestId, _ -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(contestId, emitter));
        emitter.onTimeout(() -> remove(contestId, emitter));
        emitter.onError((_) -> remove(contestId, emitter));

        trySend(emitter, new StandingsEvent("HEARTBEAT", contestId, null, java.util.List.of()));
        return emitter;
    }

    public void broadcast(Long contestId, StandingsEvent ev) {
        var list = emitters.getOrDefault(contestId, new CopyOnWriteArrayList<>());
        for (var em : list) trySend(em, ev);
    }

    private void trySend(SseEmitter emitter, StandingsEvent ev) {
        try {
            emitter.send(SseEmitter.event()
                .name(ev.type())
                .data(ev)
                .reconnectTime(5000));
        } catch (IOException e) {
            emitter.complete();
        }
    }

    private void remove(Long contestId, SseEmitter emitter) {
        emitters.getOrDefault(contestId, new CopyOnWriteArrayList<>()).remove(emitter);
    }
}
