/**
 * API Service with offline-first caching and embedded fallback data.
 */

import { FALLBACK_NODES, FALLBACK_EDGES } from '../utils/campusData';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CACHE_PREFIX = 'campus_nav_';

// ─── Cache Helpers ───
function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) return data;
    return null;
  } catch { return null; }
}

function setCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) { console.warn('Cache storage failed:', e); }
}

async function fetchFromAPI(endpoint, cacheKey, fallback) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    const data = json.data || [];
    setCache(cacheKey, data);
    return data;
  } catch {
    const cached = getCached(cacheKey);
    if (cached) return cached;
    // Use embedded fallback data
    setCache(cacheKey, fallback);
    return fallback;
  }
}

export async function fetchNodes() {
  const cached = getCached('nodes');
  if (cached) {
    fetchFromAPI('/nodes', 'nodes', FALLBACK_NODES).catch(() => {});
    return cached;
  }
  return fetchFromAPI('/nodes', 'nodes', FALLBACK_NODES);
}

export async function fetchEdges() {
  const cached = getCached('edges');
  if (cached) {
    fetchFromAPI('/edges', 'edges', FALLBACK_EDGES).catch(() => {});
    return cached;
  }
  return fetchFromAPI('/edges', 'edges', FALLBACK_EDGES);
}

export async function searchNodes(query) {
  if (!query || query.trim().length === 0) return [];
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    const json = await response.json();
    return json.data || [];
  } catch {
    // Offline fallback: search from cached or embedded data
    const nodes = getCached('nodes') || FALLBACK_NODES;
    const q = query.toLowerCase();
    return nodes.filter(
      (n) => n.name.toLowerCase().includes(q) ||
             n.type.toLowerCase().includes(q) ||
             (n.description && n.description.toLowerCase().includes(q))
    );
  }
}

const apiService = { fetchNodes, fetchEdges, searchNodes };
export default apiService;
