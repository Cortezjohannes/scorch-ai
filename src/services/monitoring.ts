import { OpenAI } from 'openai';

interface UsageMetrics {
  timestamp: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  endpoint: string;
  success: boolean;
  error?: {
    statusCode: string | number;
    errorCode: string;
    errorMessage: string;
  };
}

class APIMonitoring {
  private static instance: APIMonitoring;
  private metrics: UsageMetrics[] = [];
  private totalCost: number = 0;
  private readonly COST_LIMIT = 5; // $5 credit limit
  private readonly ALERT_THRESHOLD = 0.8; // 80% of limit

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): APIMonitoring {
    if (!APIMonitoring.instance) {
      APIMonitoring.instance = new APIMonitoring();
    }
    return APIMonitoring.instance;
  }

  public logUsage(metrics: Omit<UsageMetrics, 'timestamp'>) {
    const entry: UsageMetrics = {
      ...metrics,
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(entry);
    this.totalCost += entry.cost;

    // Check if we're approaching the limit
    if (this.totalCost >= this.COST_LIMIT * this.ALERT_THRESHOLD) {
      this.sendAlert();
    }
  }

  private sendAlert() {
    // This is where you'd implement your alert system
    // For now, we'll just log to console
    console.warn(`
      ⚠️ API Usage Alert ⚠️
      Current cost: $${this.totalCost.toFixed(2)}
      Approaching limit: $${this.COST_LIMIT}
      Remaining credit: $${(this.COST_LIMIT - this.totalCost).toFixed(2)}
    `);
  }

  public getMetrics(): UsageMetrics[] {
    return this.metrics;
  }

  public getTotalCost(): number {
    return this.totalCost;
  }

  public getRemainingCredit(): number {
    return this.COST_LIMIT - this.totalCost;
  }
}

export const monitoring = APIMonitoring.getInstance(); 