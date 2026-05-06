/**
 * Seed script for Acharya Institute of Technology campus data.
 * Coordinates mapped from actual campus layout.
 * Road network traced from OpenStreetMap tiles.
 *
 * Run: node server/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Node = require('./models/Node');
const Edge = require('./models/Edge');

const NODES = [
  // Gates
  { id: 'gate_1', name: 'Gate-1', type: 'gate', coordinates: [13.083572, 77.484059], description: 'Gate 1 – South entrance near MBA Block' },
  { id: 'gate_2', name: 'Gate-2', type: 'gate', coordinates: [13.083536, 77.484051], description: 'Gate 2 – Adjacent south entrance' },
  { id: 'gate_3', name: 'Gate-3', type: 'gate', coordinates: [13.085472, 77.486376], description: 'Gate 3 – East entrance near Civil Block' },
  { id: 'gate_4', name: 'Gate-4', type: 'gate', coordinates: [13.086112, 77.486323], description: 'Gate 4 – North-east entrance' },

  // Blocks & Landmarks
  { id: 'pharmacy_college', name: 'Acharya College of Pharmacy', type: 'block', coordinates: [13.084541, 77.482254], description: 'Pharmacy college building' },
  { id: 'acharya_cafe', name: 'Acharya Cafe', type: 'block', coordinates: [13.08486, 77.482163], description: 'Campus cafeteria' },
  { id: 'ece_block', name: 'ECE Block', type: 'block', coordinates: [13.084238, 77.483466], description: 'Electronics & Communication Engineering' },
  { id: 'stadium', name: 'Acharya Stadium', type: 'block', coordinates: [13.085785, 77.482817], description: 'Main stadium and sports arena' },
  { id: 'nrv_architecture', name: "Acharya's NRV School of Architecture", type: 'block', coordinates: [13.084009, 77.48212], description: "Acharya's NRV School of Architecture" },
  { id: 'football_ground', name: 'Football Ground', type: 'block', coordinates: [13.085127, 77.483938], description: 'Football and athletics ground' },
  { id: 'basketball_court', name: 'Basketball Court', type: 'block', coordinates: [13.085597, 77.483906], description: 'Outdoor basketball court' },
  { id: 'central_library', name: 'Central Library', type: 'block', coordinates: [13.084552, 77.483815], description: 'Main library with digital section' },
  { id: 'mech_block', name: 'Mechanical Block', type: 'block', coordinates: [13.084327, 77.484486], description: 'Mechanical Engineering Department' },
  { id: 'mba_block', name: 'MBA Block', type: 'block', coordinates: [13.083805, 77.484094], description: 'MBA Department' },
  { id: 'ct_block', name: 'CT Block', type: 'block', coordinates: [13.085466, 77.484577], description: 'CT Department Block' },
  { id: 'admin_block', name: 'Admin Block', type: 'block', coordinates: [13.085649, 77.485591], description: 'Administrative offices & principal chamber' },
  { id: 'cse_block', name: 'CSE Block', type: 'block', coordinates: [13.08496, 77.485017], description: 'Computer Science & Engineering Department' },
  { id: 'civil_block', name: 'Civil / ANA Block', type: 'block', coordinates: [13.084782, 77.485896], description: 'Civil Engineering / ANA Department' },
  { id: 'aero_block', name: 'Aeronautical Block', type: 'block', coordinates: [13.084541, 77.485478], description: 'Aeronautical Engineering Department' },
  { id: 'graduation_studies', name: 'Graduation Studies', type: 'block', coordinates: [13.08404, 77.484872], description: 'Post-graduation and research wing' },
  { id: 'acharya_parking', name: 'Acharya Parking', type: 'block', coordinates: [13.08532, 77.485805], description: 'Main vehicle parking area' },
  { id: 'acharya_lake', name: 'Acharya Lake', type: 'block', coordinates: [13.0866, 77.482613], description: 'Campus lake area' },

  // Junctions — Road A (south entry, N-S)
  { id: 'j_a1', name: 'South Entry', type: 'junction', coordinates: [13.08365, 77.48405] },
  { id: 'j_a2', name: 'MBA Road', type: 'junction', coordinates: [13.08390, 77.48405] },
  { id: 'j_a3', name: 'MBA-ECE Fork', type: 'junction', coordinates: [13.08410, 77.48400] },
  { id: 'j_a4', name: 'Central Intersection', type: 'junction', coordinates: [13.08430, 77.48400] },

  // Junctions — Road C (center N-S extension)
  { id: 'j_c1', name: 'CT Road South', type: 'junction', coordinates: [13.08460, 77.48400] },
  { id: 'j_c2', name: 'CT Block Junction', type: 'junction', coordinates: [13.08500, 77.48420] },
  { id: 'j_c3', name: 'Sports Road South', type: 'junction', coordinates: [13.08530, 77.48400] },
  { id: 'j_c4', name: 'Sports Junction', type: 'junction', coordinates: [13.08550, 77.48390] },

  // Junctions — Road B (E-W central)
  { id: 'j_b1', name: 'Library Road West', type: 'junction', coordinates: [13.08430, 77.48350] },
  { id: 'j_b2', name: 'Library Junction', type: 'junction', coordinates: [13.08430, 77.48380] },
  { id: 'j_b3', name: 'Mech Block Road', type: 'junction', coordinates: [13.08430, 77.48440] },
  { id: 'j_b4', name: 'Mech-Grad Junction', type: 'junction', coordinates: [13.08420, 77.48480] },

  // Junctions — Road E (N-S east side)
  { id: 'j_e1', name: 'Graduation Road', type: 'junction', coordinates: [13.08410, 77.48500] },
  { id: 'j_e2', name: 'Aero Junction', type: 'junction', coordinates: [13.08450, 77.48510] },
  { id: 'j_e3', name: 'CSE Junction', type: 'junction', coordinates: [13.08490, 77.48510] },
  { id: 'j_e4', name: 'CSE-Admin Road', type: 'junction', coordinates: [13.08520, 77.48530] },
  { id: 'j_e5', name: 'Civil Road', type: 'junction', coordinates: [13.08480, 77.48560] },
  { id: 'j_e6', name: 'Civil-Gate3 Road', type: 'junction', coordinates: [13.08500, 77.48590] },

  // Junctions — Road D (E-W north side)
  { id: 'j_d1', name: 'Admin Road West', type: 'junction', coordinates: [13.08555, 77.48480] },
  { id: 'j_d2', name: 'Admin Junction', type: 'junction', coordinates: [13.08560, 77.48540] },
  { id: 'j_d3', name: 'Parking Junction', type: 'junction', coordinates: [13.08545, 77.48580] },
  { id: 'j_d4', name: 'Gate-3 Road', type: 'junction', coordinates: [13.08548, 77.48620] },
  { id: 'j_d5', name: 'Gate-4 Junction', type: 'junction', coordinates: [13.08590, 77.48620] },

  // Junctions — Road F (west side)
  { id: 'j_f1', name: 'NRV Road', type: 'junction', coordinates: [13.08405, 77.48230] },
  { id: 'j_f2', name: 'Pharmacy Junction', type: 'junction', coordinates: [13.08445, 77.48240] },
  { id: 'j_f3', name: 'Cafe Junction', type: 'junction', coordinates: [13.08485, 77.48230] },
  { id: 'j_f4', name: 'West Road Bend', type: 'junction', coordinates: [13.08510, 77.48270] },
  { id: 'j_f5', name: 'Stadium Junction', type: 'junction', coordinates: [13.08560, 77.48280] },
  { id: 'j_f6', name: 'Lake Road', type: 'junction', coordinates: [13.08620, 77.48280] },

  // Junctions — ECE connector
  { id: 'j_ece1', name: 'ECE Road South', type: 'junction', coordinates: [13.08415, 77.48320] },
  { id: 'j_ece2', name: 'ECE Road North', type: 'junction', coordinates: [13.08430, 77.48340] },

  // Junctions — Sports-Stadium connector
  { id: 'j_s1', name: 'Sports-Stadium Road', type: 'junction', coordinates: [13.08560, 77.48340] },

  // Junctions — CT-to-CSE connector
  { id: 'j_ce1', name: 'CT-CSE Road East', type: 'junction', coordinates: [13.08500, 77.48480] },
  { id: 'j_ce2', name: 'CT-CSE Road South', type: 'junction', coordinates: [13.08490, 77.48500] },
];

const EDGES = [
  // Road A: South entry
  { from: 'gate_1', to: 'j_a1', distance: 10 },
  { from: 'gate_2', to: 'j_a1', distance: 10 },
  { from: 'j_a1', to: 'mba_block', distance: 20 },
  { from: 'j_a1', to: 'j_a2', distance: 30 },
  { from: 'j_a2', to: 'mba_block', distance: 15 },
  { from: 'j_a2', to: 'j_a3', distance: 25 },
  { from: 'j_a3', to: 'j_a4', distance: 25 },

  // Road B: E-W central
  { from: 'j_ece2', to: 'j_b1', distance: 15 },
  { from: 'j_b1', to: 'j_b2', distance: 35 },
  { from: 'j_b2', to: 'central_library', distance: 10 },
  { from: 'j_b2', to: 'j_a4', distance: 25 },
  { from: 'j_a4', to: 'j_b3', distance: 45 },
  { from: 'j_b3', to: 'mech_block', distance: 10 },
  { from: 'j_b3', to: 'j_b4', distance: 45 },
  { from: 'j_b4', to: 'j_e1', distance: 25 },

  // Road C: N-S center extension
  { from: 'j_a4', to: 'j_c1', distance: 35 },
  { from: 'j_c1', to: 'j_c2', distance: 50 },
  { from: 'j_c2', to: 'ct_block', distance: 20 },
  { from: 'j_c2', to: 'j_c3', distance: 40 },
  { from: 'j_c3', to: 'j_c4', distance: 25 },
  { from: 'j_c4', to: 'basketball_court', distance: 10 },
  { from: 'j_c4', to: 'football_ground', distance: 50 },

  // Road D: E-W north
  { from: 'j_c4', to: 'j_d1', distance: 50 },
  { from: 'j_d1', to: 'j_d2', distance: 70 },
  { from: 'j_d2', to: 'admin_block', distance: 15 },
  { from: 'j_d2', to: 'j_d3', distance: 45 },
  { from: 'j_d3', to: 'acharya_parking', distance: 10 },
  { from: 'j_d3', to: 'j_d4', distance: 45 },
  { from: 'j_d4', to: 'gate_3', distance: 20 },
  { from: 'j_d4', to: 'j_d5', distance: 50 },
  { from: 'j_d5', to: 'gate_4', distance: 25 },

  // Road E: N-S east side
  { from: 'j_e1', to: 'graduation_studies', distance: 10 },
  { from: 'j_e1', to: 'j_e2', distance: 50 },
  { from: 'j_e2', to: 'aero_block', distance: 15 },
  { from: 'j_e2', to: 'j_e3', distance: 45 },
  { from: 'j_e3', to: 'cse_block', distance: 10 },
  { from: 'j_e3', to: 'j_e4', distance: 40 },
  { from: 'j_e4', to: 'j_d2', distance: 45 },
  { from: 'j_e3', to: 'j_e5', distance: 55 },
  { from: 'j_e5', to: 'civil_block', distance: 10 },
  { from: 'j_e5', to: 'j_e6', distance: 35 },
  { from: 'j_e6', to: 'j_d3', distance: 55 },
  { from: 'j_e6', to: 'j_d4', distance: 55 },

  // Road F: West side
  { from: 'j_f1', to: 'nrv_architecture', distance: 15 },
  { from: 'j_f1', to: 'j_f2', distance: 50 },
  { from: 'j_f2', to: 'pharmacy_college', distance: 15 },
  { from: 'j_f2', to: 'j_f3', distance: 45 },
  { from: 'j_f3', to: 'acharya_cafe', distance: 10 },
  { from: 'j_f3', to: 'j_f4', distance: 50 },
  { from: 'j_f4', to: 'j_f5', distance: 55 },
  { from: 'j_f5', to: 'stadium', distance: 25 },
  { from: 'j_f5', to: 'j_f6', distance: 70 },
  { from: 'j_f6', to: 'acharya_lake', distance: 50 },

  // Connecting roads
  { from: 'j_f2', to: 'j_ece1', distance: 80 },
  { from: 'j_ece1', to: 'ece_block', distance: 15 },
  { from: 'j_ece1', to: 'j_ece2', distance: 25 },
  { from: 'j_a3', to: 'j_ece1', distance: 80 },
  { from: 'j_c4', to: 'j_s1', distance: 55 },
  { from: 'j_s1', to: 'j_f5', distance: 65 },
  { from: 'j_c2', to: 'j_ce1', distance: 65 },
  { from: 'j_ce1', to: 'j_ce2', distance: 25 },
  { from: 'j_ce2', to: 'j_e3', distance: 15 },
  { from: 'j_c3', to: 'football_ground', distance: 30 },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Node.deleteMany({});
    await Edge.deleteMany({});
    console.log('🗑️  Cleared existing data');

    await Node.insertMany(NODES);
    console.log(`📍 Inserted ${NODES.length} nodes`);

    // Insert bidirectional edges
    const biEdges = [];
    EDGES.forEach(e => {
      biEdges.push(e);
      biEdges.push({ from: e.to, to: e.from, distance: e.distance });
    });
    await Edge.insertMany(biEdges);
    console.log(`🔗 Inserted ${biEdges.length} edges`);

    console.log('\n🎉 Campus data seeded!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
}

seedDatabase();
