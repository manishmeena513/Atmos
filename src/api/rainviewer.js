/**
 * RainViewer Free Global Radar Tile Provider (Keyless)
 * Documentation: https://www.rainviewer.com/api/weather-maps-api.html
 */

export async function fetchRainViewerMaps() {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!res.ok) throw new Error(`RainViewer status ${res.status}`);
    const data = await res.json();

    const host = data.host || 'https://tilecache.rainviewer.com';
    const past = data.radar?.past || [];

    return {
      host,
      frames: past.map((f, idx) => ({
        time: f.time,
        date: new Date(f.time * 1000),
        timeLabel: new Date(f.time * 1000).toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        }),
        path: f.path,
        isLatest: idx === past.length - 1,
        tileUrl: `${host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`,
      })),
    };
  } catch (err) {
    console.warn('RainViewer API unavailable:', err);
    return null;
  }
}
