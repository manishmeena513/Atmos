/**
 * Performance Tier Detection for Canvas & 3D Shaders
 */

export function getDeviceTier() {
  if (typeof window === 'undefined') {
    return { tier: 'high', maxRainParticles: 350, maxSnowParticles: 200, enableBlur: true };
  }

  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (cores >= 8 && memory >= 8 && !isMobile) {
    return {
      tier: 'high',
      maxRainParticles: 450,
      maxSnowParticles: 250,
      enableBlur: true,
      lightningProbability: 0.008,
    };
  }

  if (cores >= 4 && !isMobile) {
    return {
      tier: 'mid',
      maxRainParticles: 250,
      maxSnowParticles: 140,
      enableBlur: true,
      lightningProbability: 0.005,
    };
  }

  return {
    tier: 'low',
    maxRainParticles: 120,
    maxSnowParticles: 70,
    enableBlur: false,
    lightningProbability: 0.003,
  };
}
