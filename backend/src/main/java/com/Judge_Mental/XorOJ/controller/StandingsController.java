package com.Judge_Mental.XorOJ.controller;

import com.Judge_Mental.XorOJ.dto.StandingRow;
import com.Judge_Mental.XorOJ.dto.StandingsDTO;
import com.Judge_Mental.XorOJ.dto.StandingsEvent;
import com.Judge_Mental.XorOJ.live.StandingsBroadcaster;
import com.Judge_Mental.XorOJ.service.ScoreboardService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/standings/contests/{contestId}")
public class StandingsController {

    private final ScoreboardService scoreboard;
    private final StandingsBroadcaster broadcaster;

    public StandingsController(ScoreboardService scoreboard, StandingsBroadcaster broadcaster) {
        this.scoreboard = scoreboard;
        this.broadcaster = broadcaster;
    }

    @GetMapping
    public ResponseEntity<StandingsDTO> snapshot(
            @PathVariable Long contestId,
            @RequestHeader(value = "If-None-Match", required = false) String inm) {

        StandingsDTO dto = scoreboard.getSnapshot(contestId);
        String etag = "\"" + dto.version() + "\"";

        if (etag.equals(inm)) {
            return ResponseEntity.status(304).eTag(etag).build();
        }
        return ResponseEntity.ok()
                .eTag(etag)
                .cacheControl(CacheControl.noStore())
                .body(dto);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable Long contestId) {
        return broadcaster.register(contestId);
    }

    // Call this from your verdict pipeline when one user's row changed
    @PostMapping("/row")
    public void rowUpdate(@PathVariable Long contestId,
                          @RequestParam List<Long> problemIds,
                          @RequestBody StandingRow row) {
        long v = scoreboard.applyRowUpdate(contestId, problemIds, row);
        broadcaster.broadcast(contestId, new StandingsEvent("ROW_UPDATE", contestId, v, List.of(row)));
    }

    // Optional: manual finalize trigger (e.g., admin button)
    @PostMapping("/finalize")
    public void finalizeNow(@PathVariable Long contestId) {
        scoreboard.finalizeIfEnded(contestId);
        long v = scoreboard.getSnapshot(contestId).version();
        broadcaster.broadcast(contestId, new StandingsEvent("FINALIZED", contestId, v, List.of()));
    }
}
