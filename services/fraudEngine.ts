
import { Transaction, RiskAnalysis, Decision, RiskFlag, UserHistory, Strategy } from '../types';
import { SYSTEM_CONFIG } from '../constants';

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
      ruleScore += 40;
    }
    if (history.recentTransactionCount > 5) {
      flags.push(RiskFlag.VELOCITY_SPIKE);
      ruleScore += 25;
    }
    if (!history.lastDeviceIds.includes(transaction.device.id)) {
      flags.push(RiskFlag.NEW_DEVICE);
      ruleScore += 15;
    }
    if (transaction.amount > history.avgTransactionValue * 10) {
      flags.push(RiskFlag.HIGH_VALUE);
      ruleScore += 20;
    }

    let mlScore = 0;
    try {
      if (Math.random() < 0.02) throw new Error("ML Timeout");
      mlScore = this.simulateMLInference(transaction, history);
    } catch (e) {
      isFallback = true;
      mlScore = ruleScore;
    }

    // Apply Strategy Weights
    const finalScore = isFallback ? ruleScore : (ruleScore * strategy.ruleWeight + mlScore * strategy.mlWeight);
    
    let decision = Decision.APPROVE;
    if (finalScore >= SYSTEM_CONFIG.FRAUD_THRESHOLD_BLOCK) {
      decision = Decision.BLOCK;
    } else if (finalScore >= SYSTEM_CONFIG.FRAUD_THRESHOLD_REVIEW) {
      decision = Decision.MANUAL_REVIEW;
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
      strategyName: strategy.name
    };
  }

  private simulateMLInference(tx: Transaction, history: UserHistory): number {
    let score = 20;
    if (tx.merchant.toLowerCase().includes('crypto')) score += 40;
    if (['Lagos', 'Moscow', 'Dubai'].includes(tx.location.city)) score += 15;
    return Math.min(score + (Math.random() * 30), 100);
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
