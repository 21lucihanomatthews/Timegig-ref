import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // API routes
  app.post("/api/verify-id", async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing image data" });
      }

      // Remove data:image/jpeg;base64, prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: "Analyze this ID document. Extract the information and determine if it meets the following criteria:\n1. Name and Surname are clearly visible.\n2. Identity Number is clearly visible.\n3. The document is from South Africa (must be a South African ID card or document).\n\nRespond with a JSON object in the following format:\n{\n  \"isValid\": boolean,\n  \"extractedName\": \"string or null\",\n  \"extractedIdNumber\": \"string or null\",\n  \"reason\": \"string explaining why it was approved or declined\",\n  \"isSouthAfrican\": boolean\n}"
              },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: 'image/jpeg' // or whatever it was
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const resultText = response.text;
      
      if (!resultText) {
        throw new Error("No response from Gemini");
      }

      const resultData = JSON.parse(resultText);
      res.json(resultData);

    } catch (error) {
      console.error("Error verifying ID:", error);
      res.status(500).json({ error: "Failed to verify identity document" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
