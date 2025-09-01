package com.Judge_Mental.XorOJ.service;

import com.Judge_Mental.XorOJ.dto.*;
import com.Judge_Mental.XorOJ.repo.ContestReadRepository;
import com.Judge_Mental.XorOJ.entity.StandingsSnapshotEntity;
import com.Judge_Mental.XorOJ.repo.StandingsSnapshotRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ScoreboardService {

    private final StandingsSnapshotRepository snapshotRepo;
    private final ContestReadRepository contestRepo;
    private final ObjectMapper objectMapper;

    public ScoreboardService(StandingsSnapshotRepository snapshotRepo,
                             ContestReadRepository contestRepo,
                             ObjectMapper objectMapper) {
        this.snapshotRepo = snapshotRepo;
        this.contestRepo = contestRepo;
        this.objectMapper = objectMapper;
    }

    // contestId -> in-memory snapshot
    private final Map<Long, Snapshot> boards = new ConcurrentHashMap<>();

    // ---------- Public API ----------

    public StandingsDTO getSnapshot(Long contestId) {
        Snapshot s = boards.computeIfAbsent(contestId, this::createSnapshotFromDb);
        return s.toDTO();
    }

    public long applyRowUpdate(Long contestId, List<Long> problemIds, StandingRow row) {
        Snapshot s = boards.computeIfAbsent(contestId, this::createSnapshotFromDb);
        if (s.finalized) return s.version.get(); // ignore updates after finalize
        s.setProblemIds(problemIds);
        s.upsertRow(row);
        return s.version.incrementAndGet();
    }

    /** Replace whole snapshot (used on rebuild). */
    public long replaceSnapshot(Long contestId, List<Long> problemIds, List<StandingRow> rows) {
        Snapshot s = boards.computeIfAbsent(contestId, this::createSnapshotFromDb);
        if (s.finalized) return s.version.get();
        s.setProblemIds(problemIds);
        s.rowsByUser.clear();
        for (var r : rows) s.rowsByUser.put(r.userId(), r);
        return s.version.incrementAndGet();
    }

    /** Persist current snapshot (not marked finalized). */
    public void persistSnapshot(Long contestId) {
        Snapshot s = boards.get(contestId);
        if (s == null) return;
        writeSnapshotEntity(s, false);
    }

    /** Finalize & persist once when contest ended. Safe to call repeatedly. */
    public void finalizeIfEnded(Long contestId) {
        Snapshot s = boards.computeIfAbsent(contestId, this::createSnapshotFromDb);
        if (s.finalized) return;
        if (s.now() >= s.endEpochMs) {
            s.finalized = true;
            writeSnapshotEntity(s, true);
        }
    }

    /** Called by scheduler to finalize all ended contests currently in memory. */
    public void finalizeEndedContests() {
        boards.keySet().forEach(this::finalizeIfEnded);
    }

    /** Load snapshot from DB if exists (e.g., on startup). */
    public boolean loadSnapshot(Long contestId) {
        var opt = snapshotRepo.findById(contestId);
        if (opt.isEmpty()) return false;
        try {
            StandingsSnapshotEntity e = opt.get();
            StandingsDTO dto = objectMapper.readValue(e.getPayloadJson(), StandingsDTO.class);
            Snapshot s = boards.computeIfAbsent(contestId, id -> new Snapshot(id));
            s.problemIds = dto.problemIds() == null ? List.of() : List.copyOf(dto.problemIds());
            s.rowsByUser.clear();
            if (dto.rows() != null) for (var r : dto.rows()) s.rowsByUser.put(r.userId(), r);
            s.version.set(e.getVersion());
            s.startEpochMs = dto.startEpochMs();
            s.endEpochMs = dto.endEpochMs();
            s.finalized = e.isFinalized();
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    // ---------- Internal ----------

    private Snapshot createSnapshotFromDb(Long contestId) {
        Snapshot s = new Snapshot(contestId);
        var t = contestRepo.getTimes(contestId);
        if (t != null) {
            s.startEpochMs = toEpochMs(t.getStartTime());
            s.endEpochMs = toEpochMs(t.getEndTime());
        }
        s.problemIds = Optional.ofNullable(contestRepo.findProblemIds(contestId)).orElseGet(List::of);
        // If we have a stored snapshot, prefer it:
        loadSnapshot(contestId);
        return s;
    }

    private static long toEpochMs(LocalDateTime ldt) {
        return ldt == null ? 0L : ldt.toInstant(ZoneOffset.UTC).toEpochMilli();
    }

    private void writeSnapshotEntity(Snapshot s, boolean finalized) {
        try {
            StandingsDTO dto = s.toDTO();
            String json = objectMapper.writeValueAsString(dto);
            StandingsSnapshotEntity e = new StandingsSnapshotEntity();
            e.setContestId(s.contestId);
            e.setVersion(dto.version());
            e.setPayloadJson(json);
            e.setFinalized(finalized);
            e.setUpdatedAt(LocalDateTime.now());
            snapshotRepo.save(e);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to persist standings snapshot", ex);
        }
    }

    private static final Comparator<StandingRow> ICPC = (a, b) -> {
        int s = Integer.compare(b.solved(), a.solved());
        if (s != 0) return s;
        int p = Integer.compare(a.penaltyMinutes(), b.penaltyMinutes());
        if (p != 0) return p;
        return a.username().compareToIgnoreCase(b.username());
    };

    private static String statusOf(long now, long start, long end) {
        if (start == 0 || end == 0) return "UPCOMING";
        if (now < start) return "UPCOMING";
        if (now >= end) return "ENDED";
        return "RUNNING";
    }

    // -------- Snapshot (in-memory) --------
    private static class Snapshot {
        final Long contestId;
        final AtomicLong version = new AtomicLong(0);
        volatile List<Long> problemIds = List.of();
        final Map<Long, StandingRow> rowsByUser = new ConcurrentHashMap<>();
        volatile long startEpochMs = 0L;
        volatile long endEpochMs = 0L;
        volatile boolean finalized = false;

        Snapshot(Long contestId) { this.contestId = contestId; }

        void setProblemIds(List<Long> ids) {
            if (ids != null && !ids.isEmpty()) this.problemIds = List.copyOf(ids);
        }

        void upsertRow(StandingRow row) {
            rowsByUser.put(row.userId(), row);
        }

        long now() { return toEpochMs(LocalDateTime.now()); }

        StandingsDTO toDTO() {
            var rows = new ArrayList<>(rowsByUser.values());
            rows.sort(ICPC);
            long now = now();

            return new StandingsDTO(
                contestId,
                version.get(),
                problemIds,
                rows,
                startEpochMs,
                endEpochMs,
                now,
                statusOf(now, startEpochMs, endEpochMs)
            );
        }
    }
}
