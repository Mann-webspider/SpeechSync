const express = require("express"); // Only import express once
const multer = require("multer");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const archiver = require("archiver");
const env  = require("dotenv").config();
const next = require("next");
const cors = require("cors")

const dev = process.env.NODE_ENV !== "production";
const front = next({ dev: false });

front.prepare().then(() => {
  console.log("here");
  
  // Initialize the Express app
  const app = express();
  
  // Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors({credentials:true}))
  
  // Multer setup for file uploads
  const upload = multer({ dest: "uploads/" });

  const handle = front.getRequestHandler();
  
  // Serve static files from the public folder
  app.use("/public", express.static("public"));

  
  // In-memory storage for task statuses
  const tasks = {};

  app.get("/api/health",(req,res)=>{
    res.send("ok")
  })
  // API to handle file uploads and initiate processing
  app.post("/api/translate", upload.single("file"), async (req, res) => {
    const uploadedFilePath = req.file.path; // Path of the uploaded file
    const date = new Date();
    const taskId = req.file.filename + date.getMilliseconds(); // Unique ID for the task
    const outputDir = path.join(__dirname, "outputs", taskId); // Task-specific output directory
    const zipFilePath = path.join(outputDir, `${taskId}_output.zip`); // Path for the zip file
    console.log(outputDir);
    console.log(zipFilePath);

    // Initialize task in memory
    tasks[taskId] = { status: "processing", downloadUrl: null };

    // Process file in the background
    fs.mkdirSync(outputDir, { recursive: true }); // Ensure the output directory exists

    exec(
      `whisper ${uploadedFilePath} --output_dir ${outputDir} --task translate --model medium.en`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${stderr}`);
          tasks[taskId].status = "failed";
          tasks[taskId].error = stderr;
          return;
        }

        // Create a .zip file of the outputs
        const archive = archiver("zip", { zlib: { level: 9 } });
        const outputZip = fs.createWriteStream(zipFilePath);

        outputZip.on("close", () => {
          console.log(`Archive created successfully: ${zipFilePath}`);
          tasks[taskId].status = "completed";
          tasks[taskId].downloadUrl = `/api/download/${taskId}`;
        });

        outputZip.on("error", (err) => {
          console.error(`Error creating archive: ${err.message}`);
          tasks[taskId].status = "failed";
          tasks[taskId].error = err.message;
        });

        archive.pipe(outputZip);

        // Ensure output directory has files before zipping
        const files = fs.readdirSync(outputDir);
        if (files.length === 0) {
          console.error("No output files found to zip.");
          tasks[taskId].status = "failed";
          tasks[taskId].error = "No files to zip.";
          return;
        }

        // Add files to the archive
        files.forEach((file) => {
          const filePath = path.join(outputDir, file);
          archive.file(filePath, { name: file });
        });

        archive.finalize();
      }
    );

    // Respond immediately with the task ID
    res.status(202).send({ taskId, statusUrl: `/api/status/${taskId}` });
  });

  // API to check task status
  app.get("/api/status/:taskId", (req, res) => {
    const taskId = req.params.taskId;
    const task = tasks[taskId];

    if (!task) {
      return res.status(404).send({ message: "Task not found" });
    }

    res.send(task);
  });

  // API to download the processed file
  app.get("/api/download/:taskId", (req, res) => {
    const taskId = req.params.taskId;
    const task = tasks[taskId];

    if (!task || task.status !== "completed") {
      return res.status(404).send({ message: "File not ready or not found" });
    }

    const zipFilePath = path.join(
      __dirname,
      "outputs",
      taskId,
      `${taskId}_output.zip`
    );
    res.download(zipFilePath, (err) => {
      if (err) {
        console.error(`Error sending file: ${err}`);
      }

      // Optional cleanup: Delete task and files after download
      // delete tasks[taskId];
      // fs.removeSync(path.join(__dirname, "outputs", taskId));
    });
  });
  // Handle all Next.js requests
  app.all("*", (req, res) => {
    return handle(req, res);
  }); 

  console.log("hmm");
  
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
 