import { GoogleGenAI } from "@google/genai";
import { Transaction, RiskAnalysis } from "../types";

// Note: Initialization is handled within each function to ensure fresh client state and the most current API key as per best practices.

export async function getFraudExplanation(tx: Transaction, analysis: RiskAnalysis): Promise<string> {
  // Always initialize GoogleGenAI right before the API call to ensure use of the correct environment key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this transaction and fraud engine result. Provide a concise, professional explanation for a fraud analyst.
    
    Transaction Details:
    - User: ${tx.userId}
    - Amount: ${tx.amount} ${tx.currency} at ${tx.merchant}
    - Location: ${tx.location.city}, ${tx.location.country}
    - Device: ${tx.device.type} (${tx.device.os})
    
    Engine Result:
    - Risk Score: ${analysis.score}/100
    - Decision: ${analysis.decision}
    - Flags: ${analysis.flags.join(', ')}
    - Processing Time: ${analysis.processingTimeMs.toFixed(2)}ms
    - Fallback Used: ${analysis.isFallback ? 'Yes' : 'No'}
  `;

  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-pro-preview for complex text tasks like fraud investigation explanation
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a senior financial crime investigator. Your goal is to explain why a transaction was flagged or approved based on technical signals like velocity, geo-location, and device fingerprinting. Be concise and use professional terminology.",
        temperature: 0.1,
      },
    });

    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    return "Error generating explanation. Check API key or network connection.";
  }
}

export async function getSystemInsights(metrics: any): Promise<string> {
  // Always initialize GoogleGenAI right before the API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    System Health Report:
    - Avg Latency: ${metrics.avgLatency.toFixed(2)}ms
    - Fraud Rate: ${(metrics.fraudRate * 100).toFixed(1)}%
    - Throughput: ${metrics.throughput.toFixed(1)} tx/sec
    - Model Drift: ${metrics.modelDrift.toFixed(3)}
    
    Give a one-sentence summary of system performance and any recommended tuning (e.g. adjust velocity thresholds, retrain model).
  `;

  try {
    const response = await ai.models.generateContent({
      // Using gemini-3-flash-preview for basic text tasks like system summarization
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a high-level site reliability engineer and data scientist monitoring a fraud engine.",
      },
    });
    return response.text || "System operating within normal parameters.";
  } catch (err) {
    return "System insights unavailable.";
  }
}