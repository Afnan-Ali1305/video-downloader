// server.js
import express from "express";
import ytdlp from "yt-dlp-exec";
import path from "path";
import cors from "cors";
import fs from "fs";

import { fileURLToPath } from "url";

// Fix __dirname (needed when using ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Serve files from the /downloads directory
const downloadsDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

app.use("/downloads", express.static(downloadsDir));

// Parse JSON request bodies
app.use(express.json());

/**
 * GET /downloads
 * Returns a list of downloaded files
 */
app.get("/downloads", (req, res) => {
  try {
    const files = fs.readdirSync(downloadsDir);
    res.json(files);
  } catch (err) {
    console.error("Error reading downloads folder:", err);
    res.status(500).json({ error: "Unable to read downloads directory" });
  }
});

/**
 * POST /download
 * Body: { "url": "https://...", "format": "video"|"audio", "quality": "720p"|"1080p"|... }
 * Downloads a YouTube video or audio using yt-dlp
 */
app.post("/download", async (req, res) => {
  const { url, format, quality } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    console.log(`🎥 Downloading ${format} from: ${url}`);

    let options = {
      // Save file into /downloads folder
      output: path.join(downloadsDir, "%(title)s.%(ext)s"),

      // Safer headers
      addHeader: [
        "referer:youtube.com",
        "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      ],

      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    };

    if (format === 'audio') {
      options.extractAudio = true;
      options.audioFormat = 'mp3';
      options.audioQuality = '192K';
    } else {
      // Video format with quality
      const heightMap = {
        '720p': 720,
        '1080p': 1080,
        '1440p': 1440,
        '2160p': 2160,
      };
      const height = heightMap[quality] || 1080;
      options.format = `bestvideo[height<=${height}]+bestaudio/best[height<=${height}]`;
      options.mergeOutputFormat = "mp4";
    }

    await ytdlp(url, options);

    console.log("✅ Download complete!");
    res.json({ message: "Download complete!" });
  } catch (error) {
    console.error("❌ Error downloading:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to download" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
