/**
 * Dijkstra's Shortest Path Algorithm
 * Pure JavaScript implementation for frontend route calculation.
 */

export function dijkstra(nodes, edges, sourceId, destinationId) {
  // Build adjacency list from edges
  const graph = {};
  
  nodes.forEach(node => {
    graph[node.id] = [];
  });

  edges.forEach(edge => {
    if (graph[edge.from]) {
      graph[edge.from].push({ node: edge.to, distance: edge.distance });
    }
    if (graph[edge.to]) {
      graph[edge.to].push({ node: edge.from, distance: edge.distance });
    }
  });

  // Initialize distances and previous nodes
  const distances = {};
  const previous = {};
  const visited = new Set();
  const unvisited = new Set();

  nodes.forEach(node => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });

  distances[sourceId] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current = null;
    let minDist = Infinity;

    unvisited.forEach(nodeId => {
      if (distances[nodeId] < minDist) {
        minDist = distances[nodeId];
        current = nodeId;
      }
    });

    // No reachable nodes left
    if (current === null || minDist === Infinity) break;

    // Reached destination
    if (current === destinationId) break;

    unvisited.delete(current);
    visited.add(current);

    // Update neighbors
    const neighbors = graph[current] || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.node)) continue;

      const newDist = distances[current] + neighbor.distance;
      if (newDist < distances[neighbor.node]) {
        distances[neighbor.node] = newDist;
        previous[neighbor.node] = current;
      }
    }
  }

  // Reconstruct path
  const path = [];
  let current = destinationId;

  if (previous[destinationId] === null && sourceId !== destinationId) {
    return { path: [], distance: Infinity, reachable: false };
  }

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  return {
    path,
    distance: distances[destinationId],
    reachable: distances[destinationId] !== Infinity,
  };
}

/**
 * Convert path of node IDs to array of [lat, lng] coordinates
 */
export function pathToCoordinates(path, nodes) {
  const nodeMap = {};
  nodes.forEach(node => {
    nodeMap[node.id] = node;
  });

  return path
    .map(nodeId => nodeMap[nodeId])
    .filter(Boolean)
    .map(node => node.coordinates);
}

/**
 * Calculate estimated walking time in minutes
 * Average walking speed: ~80m/min (about 5 km/h)
 */
export function calculateWalkingTime(distanceMeters) {
  const walkingSpeedMperMin = 80;
  return Math.ceil(distanceMeters / walkingSpeedMperMin);
}
