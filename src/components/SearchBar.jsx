import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchNodes } from '../services/api';

function SearchBar({ nodes, source, onSelectDestination, onClearRoute }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search
  const handleSearch = useCallback(
    async (q) => {
      if (!q || q.trim().length === 0) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      try {
        const data = await searchNodes(q);
        // Filter out junction types and the current source
        const filtered = data.filter(
          (n) => n.type !== 'junction' && n.id !== source
        );
        setResults(filtered);
        setIsOpen(filtered.length > 0);
        setSelectedIndex(-1);
      } catch (err) {
        // Fallback: local filter
        const q_lower = q.toLowerCase();
        const filtered = nodes.filter(
          (n) =>
            n.type !== 'junction' &&
            n.id !== source &&
            (n.name.toLowerCase().includes(q_lower) ||
              (n.description && n.description.toLowerCase().includes(q_lower)))
        );
        setResults(filtered);
        setIsOpen(filtered.length > 0);
        setSelectedIndex(-1);
      }
    },
    [nodes, source]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, handleSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (node) => {
    setQuery(node.name);
    setIsOpen(false);
    setIsFocused(false);
    inputRef.current?.blur();
    onSelectDestination(node);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClearRoute && onClearRoute();
    inputRef.current?.focus();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'gate':
        return '🚪';
      case 'block':
        return '🏛️';
      default:
        return '📍';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'gate':
        return '#f59e0b';
      case 'block':
        return '#6366f1';
      default:
        return '#8b5cf6';
    }
  };

  const sourceNode = nodes.find((n) => n.id === source);

  return (
    <div className="search-container">
      {/* Source indicator */}
      {sourceNode && (
        <div className="source-indicator">
          <div className="source-dot"></div>
          <span className="source-label">From: {sourceNode.name}</span>
        </div>
      )}

      {/* Search input */}
      <div className={`search-input-wrapper ${isFocused ? 'focused' : ''}`}>
        <div className="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          placeholder="Search destination... (e.g., CS Block)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (results.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="search-input"
          id="search-destination"
          autoComplete="off"
        />

        {query && (
          <button className="clear-btn" onClick={handleClear} title="Clear search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {isOpen && (
        <div className="search-dropdown" ref={dropdownRef}>
          {results.map((node, index) => (
            <div
              key={node.id}
              className={`search-result ${index === selectedIndex ? 'selected' : ''}`}
              onMouseDown={() => handleSelect(node)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="result-icon">{getTypeIcon(node.type)}</span>
              <div className="result-info">
                <span className="result-name">{node.name}</span>
                {node.description && (
                  <span className="result-desc">{node.description}</span>
                )}
              </div>
              <span
                className="result-badge"
                style={{ backgroundColor: getTypeColor(node.type) + '22', color: getTypeColor(node.type) }}
              >
                {node.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
