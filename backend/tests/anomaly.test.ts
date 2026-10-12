import { detectViewSpike } from '../src/services/anomalyService';

describe('Anomaly & View Spike Detection (Fraud Prevention)', () => {
  it('should not flag initial zero views or natural slow view increments', () => {
    const lastUpdate = new Date(Date.now() - 3600 * 1000); // 1 hour ago
    const result = detectViewSpike(1500, 1000, lastUpdate); // +500 views over 1 hour

    expect(result.isSpike).toBe(false);
    expect(result.reason).toBeUndefined();
  });

  it('should not flag initial setup when previousViews is 0', () => {
    const lastUpdate = new Date();
    const result = detectViewSpike(5000, 0, lastUpdate);

    expect(result.isSpike).toBe(false);
  });

  it('should flag rapid burst velocity (> 2,000 views/sec)', () => {
    const lastUpdate = new Date(Date.now() - 2000); // 2 seconds ago
    const result = detectViewSpike(20000, 5000, lastUpdate); // +15,000 views in 2s (7,500 views/s)

    expect(result.isSpike).toBe(true);
    expect(result.reason).toContain('Unusual velocity spike');
  });

  it('should flag immense flash spike (> 50,000 views in under 30 seconds)', () => {
    const lastUpdate = new Date(Date.now() - 29000); // 29 seconds ago
    const result = detectViewSpike(65000, 10000, lastUpdate); // +55,000 views in 29s (1,896 views/s)

    expect(result.isSpike).toBe(true);
    expect(result.reason).toContain('Flash spike detected');
  });

  it('should flag abnormal surge multiplier (> 10x jump within 60 seconds)', () => {
    const lastUpdate = new Date(Date.now() - 20000); // 20 seconds ago
    const result = detectViewSpike(35000, 2000, lastUpdate); // 17.5x jump in 20s

    expect(result.isSpike).toBe(true);
    expect(result.reason).toContain('Abnormal surge');
  });
});
