package com.Judge_Mental.XorOJ.judge;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

@Component
public class CppExecutor {

    public static class RunResult {
        public final int exitCode;
        public final String stdout;
        public final String stderr;
        public final long timeUsedMillis;
        public final long memoryUsedKB;
        RunResult(int exitCode, String stdout, String stderr, long timeUsedMillis, long memoryUsedKB) {
            this.exitCode = exitCode;
            this.stdout = stdout;
            this.stderr = stderr;
            this.timeUsedMillis = timeUsedMillis;
            this.memoryUsedKB = memoryUsedKB;
        }
        @Override public String toString() {
            return "exitCode=" + exitCode +
                   "\ntimeUsedMillis=" + timeUsedMillis +
                   "\nmemoryUsedKB=" + memoryUsedKB +
                   "\n--- stdout ---\n" + stdout +
                   "\n--- stderr ---\n" + stderr;
        }
    }

    /**
     * Compile and run C++17 source inside Docker (gcc:13).
     *
     * @param cppSource        The full C++ source (a single file main.cpp).
     * @param stdinContent     Optional standard input for the program (null allowed).
     * @param timeLimitSeconds Wall-clock time limit for execution (seconds).
     * @param memoryMB         Memory limit for the container (MB).
     * @param cpuCores         CPU cores (can be fractional, e.g., 1.0).
     */
    public RunResult execute(String cppSource, String stdinContent,
                                   int timeLimitSeconds, int memoryMB, double cpuCores) throws IOException, InterruptedException {

        // 1) Create work dir
        Path work = Files.createTempDirectory("cpp-job-");
        Path srcDir = work.resolve("src");
        Path binDir = work.resolve("bin");
        Files.createDirectories(srcDir);
        Files.createDirectories(binDir);

        // 2) Write files
        Path mainCpp = srcDir.resolve("main.cpp");
        Files.writeString(mainCpp, cppSource, StandardCharsets.UTF_8);
        Path inputTxt = srcDir.resolve("input.txt");
        Files.writeString(inputTxt, stdinContent == null ? "" : stdinContent, StandardCharsets.UTF_8);

        // 3) Build docker run command
        // We mount source read-only at /work, and a writable /out for the compiled binary.
        // We also give the container a tmpfs /tmp to keep the root FS read-only.
        String srcMount = toDockerMountPath(srcDir.toAbsolutePath());
        String binMount = toDockerMountPath(binDir.toAbsolutePath());

    List<String> cmd = new ArrayList<>(List.of(
        "docker", "run", "--rm",
        "--network", "none",
        "--cpus=" + cpuCores,
        "-m", memoryMB + "m",
        "--pids-limit", "256",
        "--read-only",
        "-v", srcMount + ":/work:ro",
        "-v", binMount + ":/out:rw",
        "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
        "gcc-time:13",
        "bash", "-lc",
        // Compile, then run with /usr/bin/time for resource usage
        "g++ -O2 -std=c++17 /work/main.cpp -o /out/main && " +
        "/usr/bin/time -f 'TIME_USED_MS=%e\\nMEM_USED_KB=%M' timeout " + timeLimitSeconds + "s /out/main < /work/input.txt"
    ));

        return run(cmd,  // overall hard cap (compile + run) — add a small buffer
                (long) (timeLimitSeconds * 1000L + 10_000L));
    }

    private static RunResult run(List<String> command, long timeoutMillis) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(false);
        Process p = pb.start();

        // Capture stdout/stderr concurrently
        Future<String> outF = readAsync(p.getInputStream());
        Future<String> errF = readAsync(p.getErrorStream());

        boolean finished = p.waitFor(timeoutMillis, TimeUnit.MILLISECONDS);
        if (!finished) {
            p.destroyForcibly();
            return new RunResult(124, "", "Runner timed out (hard cap).", -1, -1);
        }
        int code = p.exitValue();
        String out = getFuture(outF);
        String err = getFuture(errF);

        // Parse time and memory usage from stderr (from /usr/bin/time)
        long timeUsed = -1;
        long memUsed = -1;
        StringBuilder newErr = new StringBuilder();
        for (String line : err.split("\\n")) {
            if (line.startsWith("TIME_USED_MS=")) {
                try { timeUsed = (long)(Double.parseDouble(line.substring(13)) * 1000); } catch (Exception ignore) {}
            } else if (line.startsWith("MEM_USED_KB=")) {
                try { memUsed = Long.parseLong(line.substring(12)); } catch (Exception ignore) {}
            } else {
                newErr.append(line).append('\n');
            }
        }
        return new RunResult(code, out, newErr.toString().trim(), timeUsed, memUsed);
    }

    private static Future<String> readAsync(InputStream in) {
        return Executors.newSingleThreadExecutor(r -> {
            Thread t = new Thread(r, "stream-reader");
            t.setDaemon(true);
            return t;
        }).submit(() -> new String(in.readAllBytes(), StandardCharsets.UTF_8));
    }

    private static String getFuture(Future<String> f) {
        try { return f.get(1, TimeUnit.SECONDS); } catch (Exception e) { return ""; }
    }

    /**
     * Convert host path to a Docker-friendly mount string.
     * Works on Linux/Mac out of the box. On Windows, Docker Desktop requires the drive to be shared.
     */
    private static String toDockerMountPath(Path p) {
        String raw = p.toAbsolutePath().toString();
        // Normalize Windows backslashes to forward slashes for Docker
        return raw.replace('\\', '/');
    }

}
