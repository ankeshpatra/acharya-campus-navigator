import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ─── Custom Marker Icons ───

const createIcon = (color, size = 32) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="${size}" height="${size * 1.5}">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" 
            fill="${color}" filter="url(#shadow)"/>
      <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [size, size * 1.5],
    iconAnchor: [size / 2, size * 1.5],
    popupAnchor: [0, -size * 1.2],
  });
};

const sourceIcon = createIcon('#10B981', 36);    // Green
const destIcon = createIcon('#EF4444', 36);      // Red
const blockIcon = createIcon('#6366F1', 24);     // Indigo
const gateIcon = createIcon('#F59E0B', 28);      // Amber
const junctionIcon = createIcon('#8B5CF6', 18);  // Purple (smaller)

function getNodeIcon(node, isSource, isDest) {
  if (isSource) return sourceIcon;
  if (isDest) return destIcon;
  switch (node.type) {
    case 'gate': return gateIcon;
    case 'block': return blockIcon;
    case 'junction': return junctionIcon;
    default: return blockIcon;
  }
}

// ─── Map Animation Controller ───

function AnimateRoute({ routeCoords, sourceCoords, destCoords }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [80, 80], maxZoom: 18 });
    } else if (sourceCoords) {
      map.flyTo(sourceCoords, 17, { duration: 1.5 });
    }
  }, [routeCoords, sourceCoords, map]);

  return null;
}

// ─── Main MapView Component ───

function MapView({ nodes, source, destination, routeCoords, onNodeClick }) {
  const [animatedRoute, setAnimatedRoute] = useState([]);
  const animRef = useRef(null);

  // Acharya campus center (real coordinates)
  const campusCenter = [13.08500, 77.48420];
  const defaultZoom = 17;

  // Animate route drawing
  useEffect(() => {
    if (animRef.current) {
      clearInterval(animRef.current);
    }

    if (!routeCoords || routeCoords.length === 0) {
      setAnimatedRoute([]);
      return;
    }

    setAnimatedRoute([]);
    let idx = 0;

    animRef.current = setInterval(() => {
      idx++;
      if (idx >= routeCoords.length) {
        setAnimatedRoute(routeCoords);
        clearInterval(animRef.current);
      } else {
        setAnimatedRoute(routeCoords.slice(0, idx + 1));
      }
    }, 120);

    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [routeCoords]);

  const sourceNode = nodes.find(n => n.id === source);
  const destNode = nodes.find(n => n.id === destination);

  return (
    <MapContainer
      center={campusCenter}
      zoom={defaultZoom}
      className="map-container"
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={20}
      />

      {/* All campus markers */}
      {nodes.map(node => {
        const isSource = node.id === source;
        const isDest = node.id === destination;
        // Hide junctions unless they are source/dest
        if (node.type === 'junction' && !isSource && !isDest) return null;

        return (
          <Marker
            key={node.id}
            position={node.coordinates}
            icon={getNodeIcon(node, isSource, isDest)}
            eventHandlers={{
              click: () => onNodeClick && onNodeClick(node),
            }}
          >
            <Popup className="custom-popup">
              <div style={{ textAlign: 'center', padding: '4px 0' }}>
                <strong style={{ fontSize: '14px', color: '#1e293b' }}>{node.name}</strong>
                <br />
                <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'capitalize' }}>
                  {node.type}
                </span>
                {node.description && (
                  <p style={{ fontSize: '12px', color: '#475569', margin: '6px 0 0' }}>
                    {node.description}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Animated Route Polyline */}
      {animatedRoute.length >= 2 && (
        <>
          {/* Route shadow */}
          <Polyline
            positions={animatedRoute}
            pathOptions={{
              color: '#1e40af',
              weight: 8,
              opacity: 0.2,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
          {/* Main route */}
          <Polyline
            positions={animatedRoute}
            pathOptions={{
              color: '#3b82f6',
              weight: 5,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round',
              dashArray: null,
            }}
          />
        </>
      )}

      <AnimateRoute
        routeCoords={routeCoords}
        sourceCoords={sourceNode?.coordinates}
        destCoords={destNode?.coordinates}
      />
    </MapContainer>
  );
}

export default MapView;
