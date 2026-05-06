import React, { useState, useEffect } from 'react';
import { calculateWalkingTime } from '../utils/dijkstra';

function RoutePanel({ destination, distance, path, onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (destination) {
      // Slide-in animation
      setTimeout(() => setVisible(true), 50);
      setIsExpanded(false);
    } else {
      setVisible(false);
    }
  }, [destination]);

  if (!destination) return null;

  const walkingTime = calculateWalkingTime(distance);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'gate': return '🚪';
      case 'block': return '🏛️';
      default: return '📍';
    }
  };

  return (
    <div className={`route-panel ${visible ? 'visible' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {/* Drag handle */}
      <div className="panel-handle" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="handle-bar"></div>
      </div>

      {/* Panel Content */}
      <div className="panel-content">
        {/* Header */}
        <div className="panel-header">
          <div className="panel-title-row">
            <span className="panel-icon">{getTypeIcon(destination.type)}</span>
            <div className="panel-title-info">
              <h3 className="panel-title">{destination.name}</h3>
              <span className="panel-subtitle">{destination.description || destination.type}</span>
            </div>
            <button className="panel-close" onClick={onClose} title="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="panel-stats">
          <div className="stat-card">
            <div className="stat-icon distance-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" opacity="0"/>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{distance}m</span>
              <span className="stat-label">Distance</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-icon time-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{walkingTime} min</span>
              <span className="stat-label">Walking</span>
            </div>
          </div>

          <div className="stat-divider"></div>

          <div className="stat-card">
            <div className="stat-icon steps-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M4 12.5A2.5 2.5 0 0 1 6.5 10H20"/>
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{path.length - 1}</span>
              <span className="stat-label">Stops</span>
            </div>
          </div>
        </div>

        {/* Expanded: Step-by-step directions */}
        {isExpanded && path.length > 0 && (
          <div className="panel-directions">
            <h4 className="directions-title">Route Steps</h4>
            <div className="directions-list">
              {path.map((nodeId, index) => (
                <div key={nodeId} className="direction-step">
                  <div className="step-indicator">
                    <div className={`step-dot ${index === 0 ? 'start' : index === path.length - 1 ? 'end' : ''}`}></div>
                    {index < path.length - 1 && <div className="step-line"></div>}
                  </div>
                  <div className="step-info">
                    <span className="step-name">{nodeId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    {index === 0 && <span className="step-badge start-badge">Start</span>}
                    {index === path.length - 1 && <span className="step-badge end-badge">Destination</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand/Collapse toggle */}
        <button className="panel-toggle" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Hide Steps' : 'Show Steps'}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default RoutePanel;
