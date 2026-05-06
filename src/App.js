import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, useSearchParams } from 'react-router-dom';
import MapView from './components/MapView';
import SearchBar from './components/SearchBar';
import RoutePanel from './components/RoutePanel';
import { fetchNodes, fetchEdges } from './services/api';
import { dijkstra, pathToCoordinates } from './utils/dijkstra';
import './App.css';

function AppContent() {
  const [searchParams] = useSearchParams();

  // Data state
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Navigation state
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeDistance, setRouteDistance] = useState(0);

  // UI state
  const [darkMode, setDarkMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // ─── Load campus data ───
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [nodesData, edgesData] = await Promise.all([
          fetchNodes(),
          fetchEdges(),
        ]);
        setNodes(nodesData);
        setEdges(edgesData);
        setError(null);
      } catch (err) {
        setError('Failed to load campus data. Please check your connection.');
        console.error('Data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ─── Set source from QR parameter ───
  useEffect(() => {
    const src = searchParams.get('src');
    if (src && nodes.length > 0) {
      const sourceNode = nodes.find((n) => n.id === src);
      if (sourceNode) {
        setSource(src);
        setShowWelcome(false);
      }
    }
  }, [searchParams, nodes]);

  // ─── Calculate route when destination changes ───
  const calculateRoute = useCallback(
    (destNode) => {
      if (!source || !destNode || nodes.length === 0 || edges.length === 0) return;

      const result = dijkstra(nodes, edges, source, destNode.id);

      if (result.reachable) {
        setRoutePath(result.path);
        setRouteDistance(result.distance);
        const coords = pathToCoordinates(result.path, nodes);
        setRouteCoords(coords);
      } else {
        setRoutePath([]);
        setRouteCoords([]);
        setRouteDistance(0);
        alert('No route found to this destination.');
      }
    },
    [source, nodes, edges]
  );

  // ─── Handlers ───

  const handleSelectDestination = (node) => {
    setDestination(node);
    setShowWelcome(false);
    calculateRoute(node);
  };

  const handleNodeClick = (node) => {
    if (!source) {
      // If no source set, set it as source
      setSource(node.id);
      setShowWelcome(false);
      return;
    }
    if (node.id === source) return;
    handleSelectDestination(node);
  };

  const handleClearRoute = () => {
    setDestination(null);
    setRoutePath([]);
    setRouteCoords([]);
    setRouteDistance(0);
  };

  const handleGateSelect = (gateId) => {
    setSource(gateId);
    setShowWelcome(false);
  };

  // ─── Loading screen ───
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-icon">🏛️</div>
          </div>
          <h2 className="loading-title">Acharya Campus Navigator</h2>
          <p className="loading-text">Loading campus map...</p>
        </div>
      </div>
    );
  }

  // ─── Error screen ───
  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <h2 className="error-title">Connection Error</h2>
          <p className="error-text">{error}</p>
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const gates = nodes.filter((n) => n.type === 'gate');

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* Map Layer */}
      <MapView
        nodes={nodes}
        source={source}
        destination={destination?.id}
        routeCoords={routeCoords}
        onNodeClick={handleNodeClick}
        darkMode={darkMode}
      />

      {/* Top Bar with Search */}
      <div className="top-bar">
        <div className="app-header">
          <div className="logo-section">
            <span className="logo-icon">🗺️</span>
            <div className="logo-text">
              <h1 className="app-title">Acharya Navigator</h1>
              <span className="app-subtitle">Campus Navigation System</span>
            </div>
          </div>
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {source && (
          <SearchBar
            nodes={nodes}
            source={source}
            onSelectDestination={handleSelectDestination}
            onClearRoute={handleClearRoute}
          />
        )}
      </div>

      {/* Welcome / Gate Selection Panel */}
      {showWelcome && !source && (
        <div className="welcome-overlay">
          <div className="welcome-panel">
            <div className="welcome-header">
              <span className="welcome-emoji">🎓</span>
              <h2 className="welcome-title">Welcome to Acharya Campus</h2>
              <p className="welcome-subtitle">
                Select your entry gate to get started, or scan a QR code at the gate.
              </p>
            </div>

            <div className="gate-grid">
              {gates.map((gate) => (
                <button
                  key={gate.id}
                  className="gate-card"
                  onClick={() => handleGateSelect(gate.id)}
                >
                  <span className="gate-card-icon">🚪</span>
                  <span className="gate-card-name">{gate.name}</span>
                  <span className="gate-card-desc">{gate.description}</span>
                </button>
              ))}
            </div>

            <div className="qr-hint">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="3" height="3"/>
                <path d="M20 14v3h-3"/>
                <path d="M20 20h-3"/>
              </svg>
              <span>Or scan the QR code at the gate entrance</span>
            </div>
          </div>
        </div>
      )}

      {/* Route Info Panel */}
      <RoutePanel
        destination={destination}
        distance={routeDistance}
        path={routePath}
        onClose={handleClearRoute}
      />

      {/* Offline indicator */}
      <OfflineIndicator />
    </div>
  );
}

// ─── Offline Status Indicator ───
function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23"/>
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
        <line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
      <span>Offline Mode — Using cached data</span>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
