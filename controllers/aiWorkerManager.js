const { spawn } = require("child_process");
const path = require("path");
const readline = require("readline");

class AiWorkerManager {
    constructor() {
        this.workerProcess = null;
        this.rl = null;
        this.isReady = false;
        this.pendingQueue = [];
        this.activeJob = null;
        this.initWorker();
    }

    initWorker() {
        if (this.workerProcess) {
            try {
                this.workerProcess.kill();
            } catch (e) {}
        }

        const scriptPath = path.join(__dirname, "aiStudioEngine.py");
        this.workerProcess = spawn("python", ["-u", scriptPath, "--worker"], {
            cwd: path.join(__dirname, ".."),
            stdio: ["pipe", "pipe", "pipe"]
        });

        this.rl = readline.createInterface({
            input: this.workerProcess.stdout,
            terminal: false
        });

        this.rl.on("line", (line) => {
            line = line.trim();
            if (!line) return;
            try {
                const data = JSON.parse(line);
                if (data.status === "ready") {
                    this.isReady = true;
                    console.log("⚡ AI Studio Neural Worker is READY (pre-warmed in memory)");
                    this.processNext();
                    return;
                }
                if (this.activeJob) {
                    const job = this.activeJob;
                    this.activeJob = null;
                    if (data.success) {
                        job.resolve(data);
                    } else {
                        job.reject(new Error(data.error || "Worker processing error"));
                    }
                    this.processNext();
                }
            } catch (err) {
                console.error("Worker output parse error:", err, line);
            }
        });

        this.workerProcess.stderr.on("data", (chunk) => {
            const msg = chunk.toString();
            // Suppress benign onnxruntime warnings
            if (!msg.includes("UserWarning") && !msg.includes("CUDA") && !msg.includes("triton")) {
                console.warn("[AI Worker]:", msg.trim());
            }
        });

        this.workerProcess.on("close", (code) => {
            console.warn(`[AI Worker] Process exited with code ${code}. Restarting...`);
            this.isReady = false;
            if (this.activeJob) {
                this.activeJob.reject(new Error("Worker process exited"));
                this.activeJob = null;
            }
            setTimeout(() => this.initWorker(), 1200);
        });
    }

    processImage({ inputPath, outputPath, cutoutPath, prompt, stylePreset }) {
        return new Promise((resolve, reject) => {
            const timeoutTimer = setTimeout(() => {
                if (this.activeJob && this.activeJob.inputPath === inputPath) {
                    this.activeJob.reject(new Error("AI studio processing timed out after 15 seconds"));
                    this.activeJob = null;
                    this.processNext();
                }
            }, 16000);

            const job = {
                inputPath,
                outputPath,
                cutoutPath,
                prompt,
                stylePreset,
                resolve: (data) => {
                    clearTimeout(timeoutTimer);
                    resolve(data);
                },
                reject: (err) => {
                    clearTimeout(timeoutTimer);
                    reject(err);
                }
            };

            this.pendingQueue.push(job);
            if (this.isReady && !this.activeJob) {
                this.processNext();
            }
        });
    }

    processNext() {
        if (!this.isReady || this.activeJob || this.pendingQueue.length === 0) {
            return;
        }

        this.activeJob = this.pendingQueue.shift();
        const payload = JSON.stringify({
            input: this.activeJob.inputPath,
            output: this.activeJob.outputPath,
            cutout: this.activeJob.cutoutPath,
            prompt: this.activeJob.prompt,
            preset: this.activeJob.stylePreset
        });

        try {
            this.workerProcess.stdin.write(payload + "\n");
        } catch (err) {
            this.activeJob.reject(err);
            this.activeJob = null;
            this.initWorker();
        }
    }
}

const aiWorkerManager = new AiWorkerManager();
module.exports = aiWorkerManager;
