export const PRICING_MATERIALS_COMPARISON = [
  {
    material: 'PVC Wall Panels',
    range: 'Starting from ₹45 - ₹65 / sq.ft',
    durability: '15+ Years',
    waterResistance: '100% Impermeable (Stops Seepage)',
    bestFor: 'Damp walls, bedrooms, hall claddings, low maintenance',
    maintenance: 'Zero (Wipe with damp cloth)',
    installationTime: '1-2 Days',
  },
  {
    material: 'Fluted Louver Panels',
    range: 'Starting from ₹110 - ₹150 / sq.ft',
    durability: '12+ Years',
    waterResistance: 'High (Splash & Humidity Proof)',
    bestFor: 'TV unit backdrops, master bedroom headboards, luxury focus walls',
    maintenance: 'Low (Occasional feather dusting)',
    installationTime: '1-2 Days',
  },
  {
    material: 'UV Marble Sheets',
    range: 'Starting from ₹80 - ₹110 / sq.ft',
    durability: '15+ Years',
    waterResistance: '100% Waterproof & Stain Proof',
    bestFor: 'Drawing room focal walls, kitchen backsplashes, lobby cladding',
    maintenance: 'Zero (Scratch & chemical resistant)',
    installationTime: '1 Day',
  },
  {
    material: 'WPC Cladding Boards',
    range: 'Starting from ₹135 - ₹175 / sq.ft',
    durability: '20+ Years',
    waterResistance: 'High Weather & Moisture Proof',
    bestFor: 'Covered balconies, pillars, staircases, heavy-traffic areas',
    maintenance: 'Zero (Termite & rot immune)',
    installationTime: '2-3 Days',
  },
  {
    material: 'PVC Rafter False Ceiling',
    range: 'Starting from ₹65 - ₹95 / sq.ft',
    durability: '15+ Years',
    waterResistance: '100% Sag & Water Proof',
    bestFor: 'Living hall false ceilings, dining overheads, corridor rafters',
    maintenance: 'Zero (No yellow water spots)',
    installationTime: '2-3 Days',
  },
  {
    material: 'Acoustic Wood Slat Felt Panels',
    range: 'Starting from ₹175 - ₹220 / sq.ft',
    durability: '10+ Years',
    waterResistance: 'Moderate (Indoor Dry Areas)',
    bestFor: 'Home theaters, podcast rooms, executive conference walls',
    maintenance: 'Low (Dry brush vacuum)',
    installationTime: '1-2 Days',
  },
];

export const COST_FACTORS = [
  {
    title: 'Wall Surface Condition',
    desc: 'Severely uneven masonry or active groundwater seepage requires an aluminum/PVC sub-frame batten structure, whereas flat dry walls can support direct structural adhesive mounting.',
  },
  {
    title: 'Material Category & Thickness',
    desc: 'Heavy-gauge 18mm fluted louvers, diamond-cut 3D sculpted tiles, or pair-matched UV marble sheets involve distinct manufacturing and material compositions compared to standard 9mm PVC panels.',
  },
  {
    title: 'Total Square Footage',
    desc: 'Larger continuous wall areas (such as a full hall or master bedroom) benefit from bulk material procurement efficiencies and lower per-square-foot labor overheads.',
  },
  {
    title: 'Architectural Trims & Accents',
    desc: 'Incorporating brushed champagne gold T-profiles, perimeter channel trims, hidden door panels, and recessed LED cove profiles adds refined craftsmanship.',
  },
  {
    title: 'Integrated Lighting & Electricals',
    desc: 'Concealing television power conduits, adding 3000K warm LED strips, or customizing floating media consoles will factor into the total turnkey project quotation.',
  },
];

export const ESTIMATOR_CONFIG = {
  propertyTypes: [
    { id: 'apartment', label: 'Apartment / Flat', multiplier: 1.0 },
    { id: 'independent', label: 'Independent House / Kothi', multiplier: 1.05 },
    { id: 'villa', label: 'Luxury Villa / Duplex', multiplier: 1.1 },
    { id: 'office', label: 'Commercial Office / Clinic', multiplier: 1.15 },
    { id: 'showroom', label: 'Retail Showroom / Boutique', multiplier: 1.2 },
  ],
  rooms: [
    { id: 'living-room', label: 'Living Room (Main Hall)', defaultArea: 180 },
    { id: 'tv-unit', label: 'TV Feature Wall', defaultArea: 80 },
    { id: 'bedroom', label: 'Master Bedroom Bed Backdrop', defaultArea: 100 },
    { id: 'dining', label: 'Dining Area Feature Wall', defaultArea: 75 },
    { id: 'ceiling', label: 'False Ceiling (Room Overhead)', defaultArea: 150 },
    { id: 'full-house', label: 'Complete House Makeover', defaultArea: 500 },
  ],
  services: [
    { id: 'pvc-panels', label: 'PVC Wall Panels', rate: 55 },
    { id: 'fluted-panels', label: 'Architectural Fluted Louvers', rate: 130 },
    { id: 'uv-sheets', label: 'UV Marble Sheets', rate: 95 },
    { id: 'wpc-panels', label: 'WPC Heavy Cladding', rate: 155 },
    { id: 'false-ceiling', label: 'PVC False Ceiling System', rate: 80 },
    { id: 'acoustic-panels', label: 'Acoustic Slat Felt Panels', rate: 195 },
  ],
  budgetRanges: [
    { id: 'economy', label: 'Economy / Budget Friendly (₹15,000 - ₹35,000)' },
    { id: 'standard', label: 'Standard Modern Quality (₹35,000 - ₹75,000)' },
    { id: 'premium', label: 'Premium Architectural Luxury (₹75,000 - ₹1,50,000)' },
    { id: 'ultra-luxury', label: 'Ultra Luxury Turnkey (Above ₹1,50,000)' },
  ],
};
