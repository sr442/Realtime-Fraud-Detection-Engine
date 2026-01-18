# 🛡️ Sentinel | Real-Time Fraud Detection Engine

Sentinel is a production-grade, low-latency fraud detection system designed to evaluate financial transactions in sub-100ms timeframes. It utilizes a "Dual-Brain" architecture combining high-speed deterministic rules with advanced Machine Learning (ML) inference powered by Google Gemini.

## 🚀 Deployment Instructions (Vercel)

1. **Push to GitHub**: Initialize a repository and push this codebase.
2. **Connect to Vercel**: Import the repository into your Vercel dashboard.
3. **Environment Variables**: Add the following key in the Vercel Project Settings:
   - `API_KEY`: Your Google Gemini API Key from [AI Studio](https://aistudio.google.com/).
4. **Deploy**: Vercel will automatically detect the configuration and deploy the app to a global CDN.

## 🧠 Key Features

- **Sub-100ms Latency Budget**: Optimized for zero impact on checkout conversion.
- **Graceful Degradation**: Automatic fallback to the Rules Engine if ML inference exceeds SLA thresholds.
- **AI Explainability**: Real-time narrative generation using Gemini 3 Pro to explain "Black Box" decisions to human analysts.
- **Visual SLA Monitoring**: High-fidelity Recharts dashboard tracking P99 latencies and throughput.

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons.
- **Analytics**: Recharts (Custom SVG latency monitoring).
- **AI Engine**: Google Gemini API (@google/genai).
- **Inference Simulation**: Hybrid Weighted Ensemble (Rules + Stochastic ML).

---
*Developed for high-stakes financial environments where performance and security are non-negotiable.*