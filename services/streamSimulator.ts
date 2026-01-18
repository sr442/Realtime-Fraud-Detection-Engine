
import { Transaction } from '../types';
import { MOCK_MERCHANTS, MOCK_CITIES } from '../constants';

export class StreamSimulator {
  private interval: number | null = null;
  private onMessage: (tx: Transaction) => void;

  constructor(onMessage: (tx: Transaction) => void) {
    this.onMessage = onMessage;
  }

  public start(frequencyMs: number = 2000) {
    this.interval = window.setInterval(() => {
      this.generateTransaction();
    }, frequencyMs);
  }

  public stop() {
    if (this.interval) clearInterval(this.interval);
  }

  private generateTransaction() {
    const isFraudulent = Math.random() < 0.15; // 15% noise/fraud
    const userId = `user_${Math.floor(Math.random() * 50) + 1}`;
    const city = MOCK_CITIES[Math.floor(Math.random() * MOCK_CITIES.length)];
    
    // Create an "impossible travel" or "new device" scenario
    const latOffset = isFraudulent ? (Math.random() * 40 - 20) : 0;
    const lngOffset = isFraudulent ? (Math.random() * 40 - 20) : 0;

    const tx: Transaction = {
      id: `tx_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userId,
      amount: parseFloat((Math.random() * (isFraudulent ? 5000 : 500) + 5).toFixed(2)),
      currency: 'USD',
      merchant: MOCK_MERCHANTS[Math.floor(Math.random() * MOCK_MERCHANTS.length)],
      location: {
        ...city,
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset
      },
      device: {
        id: `dev_${isFraudulent ? 'unknown' : Math.floor(Math.random() * 100)}`,
        type: Math.random() > 0.5 ? 'Mobile' : 'Desktop',
        os: Math.random() > 0.5 ? 'iOS' : 'Android',
        ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.0.1`
      }
    };

    this.onMessage(tx);
  }
}
