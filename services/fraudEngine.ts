
import { Transaction, RiskAnalysis, Decision, RiskFlag, UserHistory, Strategy } from '../types';
import { SYSTEM_CONFIG } from '../constants';

const AMBIGUITY_SIGNALS = [
  "Mismatched Browser Entropy: Language headers do not match IP geolocation locale.",
  "Proxy/VPN Leak: Traffic originating from a known residential proxy network used for bulk scraping.",
  "Behavioral Anomaly: Transaction occurs outside of typical user wake/sleep cycle with high-value merchant.",
  "Velocity Cluster: Device hash associated with 3+ distinct user accounts in the last 60 minutes.",
  "Card Testing Pattern: Sequential transactions with small rounding variations at a low-verification merchant.",
  "High-Risk Sequence: First transaction after 90 days of inactivity directed to a high-liquidity merchant."
];

export class FraudEngine {
  private userCache: Map<string, UserHistory> = new Map();

  constructor() {
    this.seedUserCache();
  }

  private seedUserCache() {
    for (let i = 1; i <= 100; i++) {
      const userId = `user_${i}`;
      this.userCache.set(userId, {
        userId,
        lastLocation: { lat: 40.7128, lng: -74.0060, timestamp: Date.now() - 3600000 },
        lastDeviceIds: [`dev_${i}`],
        avgTransactionValue: Math.random() * 200 + 20,
        recentTransactionCount: 0
      });
    }
  }

  public async analyze(transaction: Transaction, strategy: Strategy): Promise<RiskAnalysis> {
    const startTime = performance.now();
    const flags: RiskFlag[] = [];
    let isFallback = false;

    const history = this.userCache.get(transaction.userId) || this.createDefaultHistory(transaction.userId);

    let ruleScore = 0;
    const distance = this.calculateDistance(
      history.lastLocation.lat, history.lastLocation.lng,
      transaction.location.lat, transaction.location.lng
    );
    const timeElapsedHours = (transaction.timestamp - history.lastLocation.timestamp) / 3600000;
    const speed = distance / Math.max(timeElapsedHours, 0.01);
    
    if (speed > SYSTEM_CONFIG.SPEED_OF_LIGHT_KMH && distance > 50) {
      flags.push(RiskFlag.IMPOSSIBLE_TRAVEL);
      ruleScore += 45;
    }
    if (history.recentTransactionCount > 5) {
      flags.push(RiskFlag.VELOCITY_SPIKE);
      ruleScore += 25;
    }
    if (!history.lastDeviceIds.includes(transaction.device.id)) {
      flags.push(RiskFlag.NEW_DEVICE);
      ruleScore += 20;
    }
    if (transaction.amount > history.avgTransactionValue * 10) {
      flags.push(RiskFlag.HIGH_VALUE);
      ruleScore += 30;
    }

    let mlScore = 0;
    try {
      if (Math.random() < 0.01) throw new Error("ML Timeout");
      mlScore = this.simulateMLInference(transaction, history);
    } catch (e) {
      isFallback = true;
      mlScore = ruleScore;
    }

    // Apply Strategy Weights
    const finalScore = isFallback ? ruleScore : (ruleScore * strategy.ruleWeight + mlScore * strategy.mlWeight);
    
    let decision = Decision.APPROVE;
    let ambiguitySignal: string | undefined;

    if (finalScore >= SYSTEM_CONFIG.FRAUD_THRESHOLD_BLOCK) {
      decision = Decision.BLOCK;
    } else if (finalScore >= SYSTEM_CONFIG.FRAUD_THRESHOLD_REVIEW) {
      decision = Decision.MANUAL_REVIEW;
      // Select a specific signal for the review queue
      ambiguitySignal = AMBIGUITY_SIGNALS[Math.floor(Math.random() * AMBIGUITY_SIGNALS.length)];
    }

    this.updateUserCache(transaction, history);

    const endTime = performance.now();
    const processingTimeMs = endTime - startTime;

    return {
      transactionId: transaction.id,
      score: Math.min(Math.round(finalScore), 100),
      decision,
      flags,
      ruleOutput: Math.round(ruleScore),
      mlOutput: Math.round(mlScore),
      processingTimeMs,
      isFallback,
      timestamp: Date.now(),
      strategyName: strategy.name,
      ambiguitySignal
    };
  }

  private simulateMLInference(tx: Transaction, history: UserHistory): number {
    let score = 30;
    if (tx.merchant.toLowerCase().includes('crypto')) score += 35;
    if (['Lagos', 'Moscow', 'Dubai'].includes(tx.location.city)) score += 15;
    if (tx.amount > 1000) score += 10;
    
    return Math.min(score + (Math.random() * 25), 100);
  }

  private createDefaultHistory(userId: string): UserHistory {
    return {
      userId,
      lastLocation: { lat: 0, lng: 0, timestamp: 0 },
      lastDeviceIds: [],
      avgTransactionValue: 50,
      recentTransactionCount: 0
    };
  }

  private updateUserCache(tx: Transaction, history: UserHistory) {
    this.userCache.set(tx.userId, {
      ...history,
      lastLocation: { ...tx.location, timestamp: tx.timestamp },
      recentTransactionCount: history.recentTransactionCount + 1,
      lastDeviceIds: Array.from(new Set([...history.lastDeviceIds, tx.device.id])).slice(-5)
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
