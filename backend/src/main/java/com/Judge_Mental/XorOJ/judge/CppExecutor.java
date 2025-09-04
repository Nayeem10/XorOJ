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

import com.Judge_Mental.XorOJ.entity.Submission.SubmissionStatus;

@Component
public class CppExecutor {

    // Thread-local to carry the container name into run() without changing signatures
    private static final ThreadLocal<String> CURRENT_CONTAINER_NAME = new ThreadLocal<>();
    
    public static class JudgeVerdict {
        public final SubmissionStatus status;
        public final String message;
        
        public JudgeVerdict(SubmissionStatus status, String message) {
            this.status = status;
            this.message = message;
        }
    }

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

        // 1) Create work dir with absolute paths
        Path work = Files.createTempDirectory("cpp-job-").toAbsolutePath();
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
        String srcMount = toDockerMountPath(srcDir);
        String binMount = toDockerMountPath(binDir);

        // Unique container name so we can kill it on timeout
        String containerName = "cpp-job-" + System.nanoTime();
        CURRENT_CONTAINER_NAME.set(containerName);

        List<String> cmd = new ArrayList<>(List.of(
            "docker", "run", "--rm",
            "--name", containerName,
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

        try {
            return run(cmd,  // overall hard cap (compile + run) — add a small buffer
                    (long) (timeLimitSeconds * 1000L + 10_000L));
        } finally {
            CURRENT_CONTAINER_NAME.remove();
        }
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

            // *** FIX: ensure the container is not orphaned ***
            String name = CURRENT_CONTAINER_NAME.get();
            if (name != null && !name.isBlank()) {
                try {
                    new ProcessBuilder("docker", "rm", "-f", name)
                        .redirectErrorStream(true)
                        .start()
                        .waitFor(3, TimeUnit.SECONDS);
                } catch (Exception ignore) {}
            }

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
     * 
     * @param p The path to convert (assumed to be absolute)
     * @return A Docker-friendly mount string
     */
    private static String toDockerMountPath(Path p) {
        // Ensure the path is absolute
        String raw = p.isAbsolute() ? p.toString() : p.toAbsolutePath().toString();
        // Normalize Windows backslashes to forward slashes for Docker
        return raw.replace('\\', '/');
    }

    /**
     * Compare the output of a source code with a main solution using a generator.
     * All paths are absolute.
     * 
     * @param sourceCodePath    Absolute path to the source code file to be judged
     * @param generatorPath     Absolute path to the generator file (generates test cases)
     * @param mainSolutionPath  Absolute path to the main solution file (correct solution)
     * @param timeLimitSeconds  Wall-clock time limit for execution (seconds)
     * @param memoryMB          Memory limit for the container (MB)
     * @param cpuCores          CPU cores (can be fractional, e.g., 1.0)
     * @return A verdict indicating if the source code produces the same output as the main solution
     */
    public JudgeVerdict compareWithGenerator(String sourceCodePath, String generatorPath, String mainSolutionPath,
                                           int timeLimitSeconds, int memoryMB, double cpuCores) throws IOException, InterruptedException {
        // Use the absolute paths directly
        Path sourceCodeFile = Path.of(sourceCodePath);
        Path generatorFile = Path.of(generatorPath);
        Path mainSolutionFile = Path.of(mainSolutionPath);
        
        // Check if all files exist
        if (!Files.exists(sourceCodeFile) || !Files.exists(generatorFile) || !Files.exists(mainSolutionFile)) {
            return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, "One or more required files not found");
        }
        
        try {
            // Create a temporary directory for the evaluation
            Path tempDir = Files.createTempDirectory("judge-evaluation-");
            
            // Step 1: Compile and run the generator using Docker
            List<String> generatorCmd = buildDockerCompileAndRunCommand(
                generatorFile.toString(), tempDir.resolve("generator").toString(), 
                null, timeLimitSeconds, memoryMB, cpuCores);
                
            RunResult generatorResult = runCommand(generatorCmd, timeLimitSeconds * 1000L + 5000L);
            if (generatorResult.exitCode != 0) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, 
                    "Generator failed: " + generatorResult.stderr);
            }
            String testInput = generatorResult.stdout;
            Path inputFile = tempDir.resolve("input.txt");
            Files.writeString(inputFile, testInput, StandardCharsets.UTF_8);
            
            // Step 2: Compile and run the main solution using Docker
            List<String> mainSolutionCmd = buildDockerCompileAndRunCommand(
                mainSolutionFile.toString(), tempDir.resolve("main_solution").toString(), 
                inputFile.toString(), timeLimitSeconds, memoryMB, cpuCores);
                
            RunResult mainSolutionResult = runCommand(mainSolutionCmd, timeLimitSeconds * 1000L + 5000L);
            if (mainSolutionResult.exitCode != 0) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, 
                    "Main solution failed: " + mainSolutionResult.stderr);
            }
            String expectedOutput = mainSolutionResult.stdout.trim();
            
            // Step 3: Compile and run the source code using Docker
            List<String> sourceCodeCmd = buildDockerCompileAndRunCommand(
                sourceCodeFile.toString(), tempDir.resolve("submission").toString(), 
                inputFile.toString(), timeLimitSeconds, memoryMB, cpuCores);
                
            RunResult sourceCodeResult = runCommand(sourceCodeCmd, timeLimitSeconds * 1000L + 5000L);
            
            // Check for various outcomes
            if (sourceCodeResult.exitCode != 0) {
                if (sourceCodeResult.exitCode == 124) {
                    return new JudgeVerdict(SubmissionStatus.TIME_LIMIT_EXCEEDED, 
                        "Time limit exceeded: " + sourceCodeResult.timeUsedMillis + "ms");
                } else if (sourceCodeResult.stderr.contains("std::bad_alloc") || sourceCodeResult.memoryUsedKB >= memoryMB * 1024) {
                    return new JudgeVerdict(SubmissionStatus.MEMORY_LIMIT_EXCEEDED, 
                        "Memory limit exceeded: " + sourceCodeResult.memoryUsedKB + "KB");
                } else {
                    return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, 
                        "Runtime error: " + sourceCodeResult.stderr);
                }
            }
            
            // Compare outputs
            String actualOutput = sourceCodeResult.stdout.trim();
            if (actualOutput.equals(expectedOutput)) {
                return new JudgeVerdict(SubmissionStatus.ACCEPTED, 
                    "Time: " + sourceCodeResult.timeUsedMillis + "ms, Memory: " + sourceCodeResult.memoryUsedKB + "KB");
            } else {
                return new JudgeVerdict(SubmissionStatus.WRONG_ANSWER, 
                    "Expected output and actual output differ");
            }
        } catch (Exception e) {
            return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, 
                "Error during execution: " + e.getMessage());
        }
    }
    
    /**
     * Helper method to build Docker command for compiling and running C++ code.
     * All paths are expected to be absolute.
     * 
     * @param sourceFilePath    Absolute path to the source file
     * @param outputDir         Absolute path to the output directory
     * @param inputFilePath     Absolute path to the input file (can be null)
     * @param timeLimitSeconds  Time limit in seconds
     * @param memoryMB          Memory limit in MB
     * @param cpuCores          CPU cores to allocate
     */
    private List<String> buildDockerCompileAndRunCommand(String sourceFilePath, String outputDir, 
                                                      String inputFilePath, int timeLimitSeconds, 
                                                      int memoryMB, double cpuCores) throws IOException {
        Path sourcePath = Path.of(sourceFilePath);
        Path outDir = Path.of(outputDir);
        Files.createDirectories(outDir);
        
        // Prepare mounts
        String srcMount = toDockerMountPath(sourcePath.getParent());
        String srcName = sourcePath.getFileName().toString();
        String binMount = toDockerMountPath(outDir);
        
        // Unique container name
        String containerName = "cpp-job-" + System.nanoTime();
        CURRENT_CONTAINER_NAME.set(containerName);
        
        List<String> cmd = new ArrayList<>(List.of(
            "docker", "run", "--rm",
            "--name", containerName,
            "--network", "none",
            "--cpus=" + cpuCores,
            "-m", memoryMB + "m",
            "--pids-limit", "256",
            "--read-only",
            "-v", srcMount + ":/work:ro",
            "-v", binMount + ":/out:rw"));
            
        // Add input file mount if provided
        if (inputFilePath != null) {
            String inputMount = toDockerMountPath(Path.of(inputFilePath).getParent());
            String inputName = Path.of(inputFilePath).getFileName().toString();
            cmd.add("-v");
            cmd.add(inputMount + ":/input:ro");
            
            // Complete the docker command
            cmd.addAll(List.of(
                "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
                "gcc-time:13",
                "bash", "-lc",
                "g++ -O2 -std=c++17 /work/" + srcName + " -o /out/main && " +
                "/usr/bin/time -f 'TIME_USED_MS=%e\\nMEM_USED_KB=%M' timeout " + 
                timeLimitSeconds + "s /out/main < /input/" + inputName
            ));
        } else {
            // Without input file
            cmd.addAll(List.of(
                "--tmpfs", "/tmp:rw,noexec,nosuid,size=64m",
                "gcc-time:13",
                "bash", "-lc",
                "g++ -O2 -std=c++17 /work/" + srcName + " -o /out/main && " +
                "/usr/bin/time -f 'TIME_USED_MS=%e\\nMEM_USED_KB=%M' timeout " + 
                timeLimitSeconds + "s /out/main"
            ));
        }
        
        return cmd;
    }
    
    /**
     * Run command with timeout and process the output.
     * This method uses the original run method for execution.
     * 
     * @param command        The command to run
     * @param timeoutMillis  Timeout in milliseconds
     * @return               Result of the execution
     */
    private RunResult runCommand(List<String> command, long timeoutMillis) throws IOException, InterruptedException {
        return run(command, timeoutMillis);
    }
    
    /**
     * Compare the output of a source code with a main solution using a provided input file.
     * All paths are absolute.
     * 
     * @param sourceCodePath    Absolute path to the source code file to be judged
     * @param mainSolutionPath  Absolute path to the main solution file (correct solution)
     * @param inputFilePath     Absolute path to the input file
     * @param timeLimitSeconds  Wall-clock time limit for execution (seconds)
     * @param memoryMB          Memory limit for the container (MB)
     * @param cpuCores          CPU cores (can be fractional, e.g., 1.0)
     * @return A verdict indicating if the source code produces the same output as the main solution
     */
    public JudgeVerdict compareWithInputFile(String sourceCodePath, String mainSolutionPath, String inputFilePath,
                                         int timeLimitSeconds, int memoryMB, double cpuCores) throws IOException, InterruptedException {
        // Use the absolute paths directly
        Path sourceCodeFile = Path.of(sourceCodePath);
        Path mainSolutionFile = Path.of(mainSolutionPath);
        Path inputFile = Path.of(inputFilePath);
        
        // Check if all files exist
        if (!Files.exists(sourceCodeFile) || !Files.exists(mainSolutionFile) || !Files.exists(inputFile)) {
            return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, "One or more required files not found");
        }
        
        try {
            // Create a temporary directory for the evaluation
            Path tempDir = Files.createTempDirectory("judge-evaluation-");
            
            // Step 1: Compile and run the main solution using Docker
            List<String> mainSolutionCmd = buildDockerCompileAndRunCommand(
                mainSolutionFile.toString(), tempDir.resolve("main_solution").toString(), 
                inputFile.toString(), timeLimitSeconds, memoryMB, cpuCores);
                
            RunResult mainSolutionResult = runCommand(mainSolutionCmd, timeLimitSeconds * 1000L + 5000L);
            if (mainSolutionResult.exitCode != 0) {
                return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, 
                    "Main solution failed: " + mainSolutionResult.stderr);
            }
            String expectedOutput = mainSolutionResult.stdout.trim();
            
            // Step 2: Compile and run the source code using Docker
            List<String> sourceCodeCmd = buildDockerCompileAndRunCommand(
                sourceCodeFile.toString(), tempDir.resolve("submission").toString(), 
                inputFile.toString(), timeLimitSeconds, memoryMB, cpuCores);
                
            RunResult sourceCodeResult = runCommand(sourceCodeCmd, timeLimitSeconds * 1000L + 5000L);
            
            // Check for various outcomes
            if (sourceCodeResult.exitCode != 0) {
                if (sourceCodeResult.exitCode == 124) {
                    return new JudgeVerdict(SubmissionStatus.TIME_LIMIT_EXCEEDED, 
                        "Time limit exceeded: " + sourceCodeResult.timeUsedMillis + "ms");
                } else if (sourceCodeResult.stderr.contains("std::bad_alloc") || sourceCodeResult.memoryUsedKB >= memoryMB * 1024) {
                    return new JudgeVerdict(SubmissionStatus.MEMORY_LIMIT_EXCEEDED, 
                        "Memory limit exceeded: " + sourceCodeResult.memoryUsedKB + "KB");
                } else {
                    return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, 
                        "Runtime error: " + sourceCodeResult.stderr);
                }
            }
            
            // Compare outputs
            String actualOutput = sourceCodeResult.stdout.trim();
            if (actualOutput.equals(expectedOutput)) {
                return new JudgeVerdict(SubmissionStatus.ACCEPTED, 
                    "Time: " + sourceCodeResult.timeUsedMillis + "ms, Memory: " + sourceCodeResult.memoryUsedKB + "KB");
            } else {
                return new JudgeVerdict(SubmissionStatus.WRONG_ANSWER, 
                    "Expected output and actual output differ");
            }
        } catch (Exception e) {
            return new JudgeVerdict(SubmissionStatus.RUNTIME_ERROR, 
                "Error during execution: " + e.getMessage());
        }
    }
}
