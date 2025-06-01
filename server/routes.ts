import type { Express } from "express";
import { createServer, type Server } from "http";
import {
  GoogleGenerativeAI,
  type ChatSession,
  type GenerateContentResult,
} from "@google/generative-ai";
import { marked } from "marked";
import { setupEnvironment } from "./env";

const env = setupEnvironment();
const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

// Healthcare-specific system prompt
const HEALTHCARE_SYSTEM_PROMPT = `
You are Sympalyze, an AI assistant specialized in providing healthcare information. 
Your purpose is to help users understand medical topics, symptoms, conditions, and treatments.

Guidelines:
1. Provide accurate, evidence-based medical information from reputable sources.
2. Always include appropriate medical disclaimers in your responses.
3. Clearly state when information is general and when a user should consult a healthcare professional.
4. For urgent or emergency symptoms, emphasize the importance of seeking immediate medical attention.
5. Avoid making definitive diagnoses - instead, discuss possibilities and explain when professional evaluation is needed.
6. Present information in a clear, organized manner that's accessible to non-medical professionals.
7. When discussing treatments, include standard approaches supported by medical evidence.
8. Cite reputable medical sources when possible (Mayo Clinic, Cleveland Clinic, MedlinePlus, etc.).

Important: Always include a disclaimer that your information is for educational purposes only and not a substitute for professional medical advice, diagnosis, or treatment.
`;

// Configure the model with healthcare focus
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7, // Slightly reduced for more factual responses
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
  systemInstruction: HEALTHCARE_SYSTEM_PROMPT,
});

// Store chat sessions in memory
const chatSessions = new Map<string, ChatSession>();

// Format raw text into proper markdown
async function formatResponseToMarkdown(
  text: string | Promise<string>
): Promise<string> {
  // Ensure we have a string to work with
  const resolvedText = await Promise.resolve(text);

  // First, ensure consistent newlines
  let processedText = resolvedText.replace(/\r\n/g, "\n");

  // Process main sections (lines that start with word(s) followed by colon)
  processedText = processedText.replace(
    /^([A-Za-z][A-Za-z\s]+):(\\s*)/gm,
    "## $1$2"
  );

  // Process sub-sections (any remaining word(s) followed by colon within text)
  processedText = processedText.replace(
    /(?<=\\n|^)([A-Za-z][A-Za-z\\s]+):(?!\\d)/gm,
    "### $1"
  );

  // Process bullet points
  processedText = processedText.replace(/^[•●○]\\s*/gm, "* ");

  // Split into paragraphs
  const paragraphs = processedText.split("\n\n").filter(Boolean);

  // Process each paragraph
  const formatted = paragraphs
    .map((p) => {
      // If it's a header or list item, preserve it
      if (p.startsWith("#") || p.startsWith("*") || p.startsWith("-")) {
        return p;
      }
      // Add proper paragraph formatting
      return `${p}\n`;
    })
    .join("\n\n");

  // Add medical disclaimer if not already present
  const disclaimer = "\n\n---\n\n*Disclaimer: This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.*";
  
  const hasDisclaimer = formatted.toLowerCase().includes("disclaimer") || 
                        formatted.toLowerCase().includes("not a substitute") ||
                        formatted.toLowerCase().includes("consult");
                        
  const finalText = hasDisclaimer ? formatted : formatted + disclaimer;

  // Configure marked options for better header rendering
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  // Convert markdown to HTML using marked
  return marked.parse(finalText);
}

interface WebSource {
  uri: string;
  title: string;
}

interface GroundingChunk {
  web?: WebSource;
}

interface TextSegment {
  startIndex: number;
  endIndex: number;
  text: string;
}

interface GroundingSupport {
  segment: TextSegment;
  groundingChunkIndices: number[];
  confidenceScores: number[];
}

interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
  groundingSupports: GroundingSupport[];
  searchEntryPoint?: any;
  webSearchQueries?: string[];
}

export function registerRoutes(app: Express): Server {
  // Search endpoint - creates a new chat session
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;

      if (!query) {
        return res.status(400).json({
          message: "Query parameter 'q' is required",
        });
      }

      // Enhance query with healthcare context if not already present
      const enhancedQuery = `
Please provide healthcare information about the following query. 
Focus on medical accuracy and include relevant health information from reputable sources.
If this appears to be about symptoms, explain possible causes, when to seek medical attention, and general treatment approaches.

Query: ${query}
      `;

      // Create a new chat session with search capability
      const chat = model.startChat({
        tools: [
          {
            // @ts-ignore - google_search is a valid tool but not typed in the SDK yet
            google_search: {},
          },
        ],
      });

      // Generate content with search tool
      const result = await chat.sendMessage(enhancedQuery);
      const response = await result.response;
      console.log(
        "Raw Google API Response:",
        JSON.stringify(
          {
            text: response.text(),
            candidates: response.candidates,
            groundingMetadata: response.candidates?.[0]?.groundingMetadata,
          },
          null,
          2
        )
      );
      const text = response.text();

      // Format the response text to proper markdown/HTML
      const formattedText = await formatResponseToMarkdown(text);

      // Extract sources from grounding metadata
      const sourceMap = new Map<
        string,
        { title: string; url: string; snippet: string }
      >();

      // Get grounding metadata from response
      const metadata = response.candidates?.[0]?.groundingMetadata as any;
      if (metadata) {
        const chunks = metadata.groundingChunks || [];
        const supports = metadata.groundingSupports || [];

        chunks.forEach((chunk: any, index: number) => {
          if (chunk.web?.uri && chunk.web?.title) {
            const url = chunk.web.uri;
            if (!sourceMap.has(url)) {
              // Find snippets that reference this chunk
              const snippets = supports
                .filter((support: any) =>
                  support.groundingChunkIndices.includes(index)
                )
                .map((support: any) => support.segment.text)
                .join(" ");

              sourceMap.set(url, {
                title: chunk.web.title,
                url: url,
                snippet: snippets || "",
              });
            }
          }
        });
      }

      const sources = Array.from(sourceMap.values());

      // Generate a session ID and store the chat
      const sessionId = Math.random().toString(36).substring(7);
      chatSessions.set(sessionId, chat);

      res.json({
        sessionId,
        summary: formattedText,
        sources,
      });
    } catch (error: any) {
      console.error("Search error:", error);
      res.status(500).json({
        message:
          error.message || "An error occurred while processing your search",
      });
    }
  });

  // Follow-up endpoint - continues existing chat session
  app.post("/api/follow-up", async (req, res) => {
    try {
      const { sessionId, query } = req.body;

      if (!sessionId || !query) {
        return res.status(400).json({
          message: "Both sessionId and query are required",
        });
      }

      const chat = chatSessions.get(sessionId);
      if (!chat) {
        return res.status(404).json({
          message: "Chat session not found",
        });
      }

      // Enhance follow-up query with healthcare context reminder
      const enhancedQuery = `
This is a follow-up question to our previous healthcare discussion. 
Please continue to provide medically accurate information from reputable sources:

${query}
      `;

      // Send follow-up message in existing chat
      const result = await chat.sendMessage(enhancedQuery);
      const response = await result.response;
      console.log(
        "Raw Google API Follow-up Response:",
        JSON.stringify(
          {
            text: response.text(),
            candidates: response.candidates,
            groundingMetadata: response.candidates?.[0]?.groundingMetadata,
          },
          null,
          2
        )
      );
      const text = response.text();

      // Format the response text to proper markdown/HTML
      const formattedText = await formatResponseToMarkdown(text);

      // Extract sources from grounding metadata
      const sourceMap = new Map<
        string,
        { title: string; url: string; snippet: string }
      >();

      // Get grounding metadata from response
      const metadata = response.candidates?.[0]?.groundingMetadata as any;
      if (metadata) {
        const chunks = metadata.groundingChunks || [];
        const supports = metadata.groundingSupports || [];

        chunks.forEach((chunk: any, index: number) => {
          if (chunk.web?.uri && chunk.web?.title) {
            const url = chunk.web.uri;
            if (!sourceMap.has(url)) {
              // Find snippets that reference this chunk
              const snippets = supports
                .filter((support: any) =>
                  support.groundingChunkIndices.includes(index)
                )
                .map((support: any) => support.segment.text)
                .join(" ");

              sourceMap.set(url, {
                title: chunk.web.title,
                url: url,
                snippet: snippets || "",
              });
            }
          }
        });
      }

      const sources = Array.from(sourceMap.values());

      res.json({
        summary: formattedText,
        sources,
      });
    } catch (error: any) {
      console.error("Follow-up error:", error);
      res.status(500).json({
        message:
          error.message ||
          "An error occurred while processing your follow-up question",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
