# Acharya Campus Navigator

An offline-friendly campus navigation system for Acharya Institute of Technology. The app renders a real campus map with Leaflet, lets users choose an entry gate, and computes the shortest walking path to a destination using Dijkstra's algorithm. Data is served from a Node/Express API backed by MongoDB, with a fully embedded fallback dataset for offline mode.

## Key Features

- Interactive map with custom markers and animated route drawing.
- Gate-first onboarding with QR-friendly source selection via URL query param.
- Shortest path routing and estimated walking time.
- Offline-first behavior with localStorage caching and embedded fallback data.
- Admin-style API endpoints for nodes/edges CRUD (basic, no auth).

## Architecture Overview

Frontend (React + Leaflet)
- Loads campus nodes/edges from API with cache fallback.
- Renders markers (gates/blocks) and a polyline route.
- Computes path client-side via Dijkstra on the loaded graph.
- Works offline using cached or embedded data.

Backend (Node + Express + MongoDB)
- Stores nodes and edges in MongoDB.
- Exposes REST endpoints under `/api` for nodes, edges, and search.
- Includes a seeding script with curated campus data.

## Project Structure

- [server/server.js](server/server.js): Express app setup, middleware, and routes.
- [server/routes/api.js](server/routes/api.js): API endpoints for nodes, edges, and search.
- [server/models/Node.js](server/models/Node.js): Node schema (gate/block/junction).
- [server/models/Edge.js](server/models/Edge.js): Edge schema (from/to/distance).
- [server/seed.js](server/seed.js): Seed script with bidirectional campus graph.
- [src/App.js](src/App.js): App shell, data loading, route calculation, UI flow.
- [src/components/MapView.jsx](src/components/MapView.jsx): Leaflet map, markers, polyline animation.
- [src/components/SearchBar.jsx](src/components/SearchBar.jsx): Destination search with API + fallback.
- [src/components/RoutePanel.jsx](src/components/RoutePanel.jsx): Route stats and step list.
- [src/services/api.js](src/services/api.js): API calls + offline cache logic.
- [src/utils/dijkstra.js](src/utils/dijkstra.js): Dijkstra + walking time utilities.
- [src/utils/campusData.js](src/utils/campusData.js): Embedded campus nodes/edges.

## Data Model

Node
- `id`: string (unique, index)
- `name`: string
- `type`: `gate` | `block` | `junction`
- `coordinates`: [lat, lng]
- `description`: string (optional)

Edge
- `from`: string (node id)
- `to`: string (node id)
- `distance`: number (meters, non-negative)

The seed script inserts bidirectional edges, so every path is walkable both ways.

## API Endpoints

Base URL: `http://localhost:5000/api`

- `GET /nodes`: List all nodes.
- `GET /edges`: List all edges.
- `GET /search?q=...`: Search nodes by name (case-insensitive, limited to 10).
- `POST /nodes`: Create a node.
- `PUT /nodes/:id`: Update a node by `id`.
- `POST /edges`: Create an edge.
- `DELETE /nodes/:id`: Delete node and related edges.

Note: There is no authentication layer yet, so treat write endpoints as admin-only in trusted environments.

## Routing Logic

- The frontend builds an adjacency list from nodes and edges.
- Dijkstra's algorithm finds the shortest path by total distance.
- The route is displayed as a polyline with a draw animation.
- Walking time is estimated at ~80 meters per minute.

## Offline Behavior

- Responses for nodes/edges are cached in `localStorage` for 24 hours.
- If the API is unavailable, cached data or embedded campus data is used.
- A service worker is registered for additional offline support.

## Environment Variables

Create a `.env` file for the server and set:

```
MONGODB_URI=<your-mongodb-connection-string>
PORT=5000
```

Optionally for the frontend:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Setup and Run

Install dependencies:

```
npm install
```

Seed the database:

```
npm run seed
```

Start the API server:

```
npm run server
```

Start the React app:

```
npm start
```

## Usage Flow

1) Pick a gate on the welcome screen or open with `?src=gate_1`.
2) Search for a destination or click a marker.
3) View distance, walking time, and optional step list.

## Tech Stack

- React 19 + Create React App
- Leaflet + React-Leaflet
- Node.js + Express 5
- MongoDB + Mongoose 9

## Notes and Limitations

- The current dataset is specific to the Acharya campus and uses curated OSM-based coordinates.
- Write endpoints are unsecured and intended for internal use.
- Route steps display raw node ids, not user-friendly turn-by-turn directions.

## Scripts

- `npm start`: Start the React dev server.
- `npm run server`: Start the API server.
- `npm run seed`: Seed MongoDB with campus data.
- `npm run build`: Build the frontend for production.

## Credits

- Campus road geometry derived from OpenStreetMap tiles.
