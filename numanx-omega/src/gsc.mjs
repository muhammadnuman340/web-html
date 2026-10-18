/** Optional Search Console search analytics adapter. Uses a short-lived access token supplied by the caller. */
export async function fetchGscSearchAnalytics({ siteUrl, accessToken, startDate, endDate, timeoutMs = 15000 }) {
  if (!siteUrl || !accessToken || !startDate || !endDate) {
    return { connected: false, status: 'not-configured', message: 'Set the site property, date range, and a valid Google OAuth access token to request GSC data.' };
  }
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({ startDate, endDate, dimensions: ['page', 'query'], rowLimit: 1000 }),
    });
    if (!response.ok) {
      const text = (await response.text()).slice(0, 500);
      return { connected: false, status: 'api-error', httpStatus: response.status, message: `Search Console API returned HTTP ${response.status}. ${text}` };
    }
    const data = await response.json();
    return { connected: true, status: 'connected', startDate, endDate, rowCount: data.rows?.length || 0, rows: data.rows || [] };
  } catch (error) {
    return { connected: false, status: 'request-error', message: error.name === 'AbortError' ? 'Search Console request timed out.' : error.message };
  } finally {
    clearTimeout(timer);
  }
}
