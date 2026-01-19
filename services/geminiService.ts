
import { GoogleGenAI } from "@google/genai";
import { Transaction, RiskAnalysis, FinancialHealth, FraudAnalyticsSummary } from "../types";

export async function getFraudExplanation(tx: Transaction, analysis: RiskAnalysis): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this transaction and fraud engine result. Provide a concise, professional explanation for a fraud analyst.
    Transaction: ${tx.amount} ${tx.currency} at ${tx.merchant} (${tx.location.city})
    Result: Score ${analysis.score}, Decision ${analysis.decision}, Flags: ${analysis.flags.join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a senior financial crime investigator. Explain why a transaction was flagged/approved concisely.",
        temperature: 0.1,
      },
    });
    return response.text || "No explanation available.";
  } catch (error) {
    return "Error generating explanation.";
  }
}

export async function getSystemInsights(metrics: any): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Health Report: Latency ${metrics.avgLatency}ms, Fraud ${metrics.fraudRate}%. One-sentence summary and tuning advice.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: "You are an SRE monitoring a fraud engine." },
    });
    return response.text || "Normal parameters.";
  } catch (err) {
    return "Insights unavailable.";
  }
}

export async function getWealthAdvisoryBrief(health: FinancialHealth, recentTx: Transaction[]): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const signalsStr = health.signals.map(s => `- ${s.type}: ${s.description} (Potential Impact: $${s.potentialImpact})`).join('\n');
  const recentSpend = recentTx.map(t => `$${t.amount} at ${t.merchant}`).join(', ');

  const prompt = `
    Analyze this client's financial health and recent spending. Provide a strategic advisory brief for their Private Wealth Manager.
    
    Current Health Metrics:
    - Yield at Risk: $${health.yieldAtRisk} (Annualized)
    - Savings Rate: ${health.savingsRate}%
    - Detected Signals:
    ${signalsStr}
    
    Recent Transactions:
    ${recentSpend}
    
    Task: Identify one high-impact strategic move the client should make this month to optimize wealth, considering their spending patterns and the "Yield at Risk". Be sophisticated and data-driven.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a senior Elite Private Wealth Advisor for Ultra High Net Worth individuals. Your advice is sophisticated, tax-aware, and focused on capital efficiency and long-term growth.",
        temperature: 0.2,
      },
    });
    return response.text || "No advisory brief generated.";
  } catch (error) {
    return "Advisory insights temporarily unavailable.";
  }
}

// NEW: Security Posture Advisory for Advisors
export async function getSecurityPostureAdvice(summary: FraudAnalyticsSummary): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const attackVectors = summary.topAttackVectors.map(v => `${v.type} (${v.count} attempts)`).join(', ');
  const locations = summary.geographicHeatmap.map(g => `${g.city}, ${g.country}`).join(', ');

  const prompt = `
    Client Fraud Profile:
    - Total Value Protected: $${summary.totalValueProtected}
    - Vulnerability Index: ${summary.vulnerabilityIndex}/100
    - Active Attack Vectors: ${attackVectors}
    - Attack Origin Points: ${locations}

    Task: Provide a "Client Security Executive Summary" for a financial advisor. 
    1. Summarize the current threat level to the client's assets.
    2. Recommend 2 specific security upgrades (e.g., geofencing, merchant category blocks, or biometric MFA) to reduce the Vulnerability Index.
    Keep it professional, high-stakes, and actionable.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a Chief Security Officer for a Global Private Bank. You provide risk mitigation advice to wealth managers to protect HNW client assets.",
        temperature: 0.2,
      },
    });
    return response.text || "No security advice available.";
  } catch (error) {
    return "Security insights unavailable.";
  }
}
