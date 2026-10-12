export interface SpikeCheckResult {
  isSpike: boolean;
  velocityViewsPerSec: number;
  deltaViews: number;
  deltaTimeSec: number;
  reason?: string;
}

/**
 * Detects whether view increment constitutes an abnormal or fraudulent spike.
 * Evaluates view velocity (views/sec) and sudden jump magnitude over time elapsed.
 */
export function detectViewSpike(
  newViews: number,
  previousViews: number,
  lastViewUpdatedAt: Date | string
): SpikeCheckResult {
  const deltaViews = newViews - previousViews;

  // If views didn't increase or this is initial zero-view setup, no spike
  if (deltaViews <= 0 || previousViews === 0) {
    return {
      isSpike: false,
      velocityViewsPerSec: 0,
      deltaViews: Math.max(0, deltaViews),
      deltaTimeSec: 0
    };
  }

  const lastUpdate = new Date(lastViewUpdatedAt).getTime();
  const now = Date.now();
  // Ensure at least 1 second to prevent division by zero
  const deltaTimeSec = Math.max(1, (now - lastUpdate) / 1000);
  const velocityViewsPerSec = deltaViews / deltaTimeSec;

  // Criteria 1: Sudden massive burst (> 2,000 views/sec with jump >= 5,000 views)
  if (velocityViewsPerSec >= 2000 && deltaViews >= 5000) {
    return {
      isSpike: true,
      velocityViewsPerSec,
      deltaViews,
      deltaTimeSec,
      reason: `Unusual velocity spike: +${deltaViews.toLocaleString()} views in ${deltaTimeSec.toFixed(1)}s (${Math.round(velocityViewsPerSec).toLocaleString()} views/sec)`
    };
  }

  // Criteria 2: Immense absolute jump in under 30 seconds (> 50,000 views)
  if (deltaViews >= 50000 && deltaTimeSec <= 30) {
    return {
      isSpike: true,
      velocityViewsPerSec,
      deltaViews,
      deltaTimeSec,
      reason: `Flash spike detected: +${deltaViews.toLocaleString()} views within ${deltaTimeSec.toFixed(1)}s`
    };
  }

  // Criteria 3: Extreme relative multiplier (> 10x previous views within 60 seconds when previousViews >= 1,000)
  if (previousViews >= 1000 && deltaViews >= previousViews * 10 && deltaTimeSec <= 60) {
    return {
      isSpike: true,
      velocityViewsPerSec,
      deltaViews,
      deltaTimeSec,
      reason: `Abnormal surge: Views jumped ${(newViews / previousViews).toFixed(1)}x in ${deltaTimeSec.toFixed(1)}s`
    };
  }

  return {
    isSpike: false,
    velocityViewsPerSec,
    deltaViews,
    deltaTimeSec
  };
}
