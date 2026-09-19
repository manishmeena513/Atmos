export default async function handler(req, res) {
  // Enable CORS for production and localhost environments
  const origin = req.headers.origin;
  const isAllowedOrigin = origin && (
    /^https:\/\/atmos-gules-two\.vercel\.app$/.test(origin) ||
    /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin) ||
    /^http:\/\/localhost:(3000|5173|4173)$/.test(origin)
  );

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { q = '', count = '10' } = req.query;

  if (!q.trim()) {
    return res.status(200).json({ results: [] });
  }

  try {
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=${count}&language=en&format=json`;

    const response = await fetch(geocodeUrl);
    if (!response.ok) {
      throw new Error(`Open-Meteo Geocoding returned status ${response.status}`);
    }
    const data = await response.json();

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Geocode API Proxy Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to geocode query' });
  }
}
