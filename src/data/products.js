export const categories = [
  { name: 'Tools & Hardware' },
  { name: 'Construction Materials' },
  { name: 'Furniture & Home' },
  { name: 'Electronics & Computers' },
  { name: 'Toys & Games' },
  { name: 'Automotive' },
  { name: 'Cars & Trucks' },
  { name: 'Motorcycles & Powersports' },
  { name: 'Office & Business' },
  { name: 'Sports & Outdoors' },
]

export const catalogCategories = [
  'Tools & Hardware',
  'Construction Materials',
  'Furniture & Home',
  'Mattresses & Bedroom',
  'Closets & Storage',
  'Commercial Furniture',
  'Electronics & Computers',
  'Phones & Tablets',
  'Gaming',
  'Toys & Games',
  'Appliances',
  'Kitchen & Dining',
  'Clothing & Footwear',
  'Beauty & Personal Care',
  'Health & OTC Medicines',
  'Sports & Outdoors',
  'Garden & Patio',
  'Automotive',
  'Cars & Trucks',
  'Motorcycles & Powersports',
  'Boats & Watercraft',
  'RVs & Campers',
  'Industrial & Heavy Equipment',
  'Collectibles & Art',
  'Music & Instruments',
  'Real Estate & Rentals',
  'Food & Grocery',
  'Pet Supplies',
  'Office & Business',
  'Office & School',
  'Books',
  'Kids & Baby',
  'Travel & Luggage',
  'Rugs & Decor',
  'Lighting',
  'Plumbing',
  'Electrical',
  'HVAC',
  'Paint & Supplies',
  'Flooring & Tile',
  'Roofing',
  'Doors & Windows',
]

const rawProducts = [
  {
    id: 'vehicle-sedan-1',
    name: '2019 Used Sedan — Clean Title',
    brand: 'Verified Marketplace Seller',
    category: 'Cars & Trucks',
    subcategory: 'Used Cars',
    sourcePrice: 14800,
    rating: 4.8,
    stock: 1,
    featured: true,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
    description: 'Example used-vehicle listing. Vehicle history, title, mileage, seller identity, inspection, taxes, registration, and pickup terms must be verified before purchase.',
    tags: ['used car', 'sedan', 'clean title', 'vehicle'],
    keywords: ['automobile', 'pre-owned', 'car for sale'],
    details: ['Example marketplace inventory', 'Independent inspection recommended', 'Local registration and taxes not included'],
  },
  {
    id: 'vehicle-motorcycle-1',
    name: '2021 Used Street Motorcycle',
    brand: 'Verified Marketplace Seller',
    category: 'Motorcycles & Powersports',
    subcategory: 'Used Motorcycles',
    sourcePrice: 6200,
    rating: 4.7,
    stock: 1,
    featured: true,
    image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
    description: 'Example pre-owned motorcycle listing. Confirm title, VIN, mileage, condition, seller identity, insurance, and pickup requirements before purchase.',
    tags: ['used motorcycle', 'street bike', 'powersports'],
    keywords: ['motorcycle for sale', 'pre-owned bike'],
    details: ['Example marketplace inventory', 'VIN and title verification required', 'Local pickup or specialist transport'],
  },
  {
    id: 'tool-drill-1',
    name: '20V Cordless Drill Driver Kit',
    brand: 'AskKhan Tools',
    category: 'Tools & Hardware',
    subcategory: 'Power Tools',
    sourcePrice: 79.99,
    rating: 4.8,
    stock: 50,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80',
    description:
      'Cordless drill and driver for construction, home improvement and professional use.',
    tags: [
      'drill',
      'cordless drill',
      'power drill',
      'driver',
      'power tools',
      'construction tools',
    ],
    keywords: [
      '20v',
      'battery drill',
      'contractor',
      'carpenter',
      'construction',
    ],
  },

  {
    id: 'tool-hammer-drill-1',
    name: 'Heavy Duty Hammer Drill',
    brand: 'AskKhan Tools',
    category: 'Tools & Hardware',
    subcategory: 'Power Tools',
    sourcePrice: 119.99,
    rating: 4.8,
    stock: 40,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=900&q=80',
    description:
      'Heavy-duty hammer drill for masonry, concrete, block and general construction.',
    tags: [
      'hammer drill',
      'masonry drill',
      'concrete drill',
      'power tools',
    ],
    keywords: [
      'construction',
      'rotary',
      'hammer',
      'concrete',
      'masonry',
    ],
  },

  {
    id: 'tool-impact-1',
    name: '20V Cordless Impact Driver',
    brand: 'AskKhan Tools',
    category: 'Tools & Hardware',
    subcategory: 'Power Tools',
    sourcePrice: 99.99,
    rating: 4.7,
    stock: 50,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=900&q=80',
    description:
      'Compact impact driver for screws, bolts and construction fasteners.',
    tags: [
      'impact driver',
      'cordless',
      'power tool',
      'screws',
      'fasteners',
    ],
    keywords: ['driver', 'impact', '20v', 'construction'],
  },

  {
    id: 'tool-circular-saw-1',
    name: '7-1/4 in Circular Saw',
    brand: 'AskKhan Tools',
    category: 'Tools & Hardware',
    subcategory: 'Power Tools',
    sourcePrice: 129.99,
    rating: 4.8,
    stock: 35,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=80',
    description:
      'Circular saw for lumber, plywood and construction materials.',
    tags: [
      'circular saw',
      'saw',
      'power saw',
      'wood cutting',
    ],
    keywords: ['lumber', 'plywood', 'construction', 'carpentry'],
  },

  {
    id: 'tool-miter-saw-1',
    name: '12 in Sliding Compound Miter Saw',
    brand: 'AskKhan Tools',
    category: 'Tools & Hardware',
    subcategory: 'Power Tools',
    sourcePrice: 349.99,
    rating: 4.9,
    stock: 20,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80',
    description:
      'Professional sliding miter saw for framing, trim and finish carpentry.',
    tags: ['miter saw', 'power saw', 'carpentry', 'construction'],
    keywords: ['12 inch', 'wood', 'trim', 'framing'],
  },

  {
    id: 'tool-grinder-1',
    name: '4-1/2 in Angle Grinder',
    brand: 'AskKhan Tools',
    category: 'Tools & Hardware',
    subcategory: 'Power Tools',
    sourcePrice: 69.99,
    rating: 4.7,
    stock: 60,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80',
    description:
      'Angle grinder for metal cutting, grinding and masonry work.',
    tags: ['angle grinder', 'grinder', 'metal tool', 'power tools'],
    keywords: ['cutting', 'metal', 'masonry', 'construction'],
  },

  {
    id: 'screw-drywall-1',
    name: 'Drywall Screws 1-5/8 in 1 lb Box',
    brand: 'AskKhan Hardware',
    category: 'Tools & Hardware',
    subcategory: 'Screws & Fasteners',
    sourcePrice: 9.99,
    rating: 4.8,
    stock: 200,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=900&q=80',
    description:
      'Coarse-thread drywall screws for wood framing and drywall installation.',
    tags: ['drywall screws', 'screws', 'fasteners'],
    keywords: ['sheetrock', 'construction', 'wood framing'],
  },

  {
    id: 'screw-deck-1',
    name: 'Exterior Deck Screws 3 in 5 lb Box',
    brand: 'AskKhan Hardware',
    category: 'Tools & Hardware',
    subcategory: 'Screws & Fasteners',
    sourcePrice: 34.99,
    rating: 4.9,
    stock: 150,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=900&q=80',
    description:
      'Exterior coated deck screws for decks, fences and outdoor lumber.',
    tags: ['deck screws', 'wood screws', 'exterior screws'],
    keywords: ['fasteners', '3 inch', 'decking', 'fence'],
  },

  {
    id: 'screw-concrete-1',
    name: 'Concrete Masonry Screws',
    brand: 'AskKhan Hardware',
    category: 'Tools & Hardware',
    subcategory: 'Screws & Fasteners',
    sourcePrice: 19.99,
    rating: 4.8,
    stock: 120,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=900&q=80',
    description:
      'Heavy-duty masonry screws for concrete, block and brick.',
    tags: ['concrete screws', 'masonry screws', 'anchors'],
    keywords: ['brick', 'block', 'fasteners', 'construction'],
  },

  {
    id: 'material-concrete-1',
    name: '80 lb Concrete Mix',
    brand: 'AskKhan Building Supply',
    category: 'Construction Materials',
    subcategory: 'Concrete & Cement',
    sourcePrice: 7.49,
    rating: 4.8,
    stock: 500,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?auto=format&fit=crop&w=900&q=80',
    description:
      'General-purpose concrete mix for slabs, footings, posts and repairs.',
    tags: ['concrete', 'cement', 'concrete mix'],
    keywords: ['80 lb', 'building material', 'masonry'],
  },

  {
    id: 'material-lumber-1',
    name: '2 in x 4 in x 8 ft Construction Lumber',
    brand: 'AskKhan Building Supply',
    category: 'Construction Materials',
    subcategory: 'Lumber',
    sourcePrice: 5.98,
    rating: 4.7,
    stock: 800,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?auto=format&fit=crop&w=900&q=80',
    description:
      'General-purpose framing lumber for construction and remodeling.',
    tags: ['2x4', 'lumber', 'wood', 'framing'],
    keywords: ['8 ft', 'construction lumber', 'stud'],
  },

  {
    id: 'material-plywood-1',
    name: '3/4 in 4 ft x 8 ft Plywood Sheet',
    brand: 'AskKhan Building Supply',
    category: 'Construction Materials',
    subcategory: 'Plywood',
    sourcePrice: 44.99,
    rating: 4.7,
    stock: 200,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?auto=format&fit=crop&w=900&q=80',
    description:
      'Plywood panel for subfloors, walls, furniture and construction.',
    tags: ['plywood', 'wood sheet', 'construction material'],
    keywords: ['4x8', '3/4 inch', 'wood'],
  },

  {
    id: 'material-drywall-1',
    name: '1/2 in 4 ft x 8 ft Drywall Panel',
    brand: 'AskKhan Building Supply',
    category: 'Construction Materials',
    subcategory: 'Drywall',
    sourcePrice: 15.99,
    rating: 4.7,
    stock: 300,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
    description:
      'Standard gypsum drywall panel for walls and ceilings.',
    tags: ['drywall', 'sheetrock', 'gypsum'],
    keywords: ['4x8', 'wall board', 'construction'],
  },

  {
    id: 'plumbing-pvc-1',
    name: 'PVC Pipe 2 in x 10 ft',
    brand: 'AskKhan Plumbing',
    category: 'Plumbing',
    subcategory: 'Pipe',
    sourcePrice: 18.99,
    rating: 4.8,
    stock: 150,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=900&q=80',
    description:
      'PVC pipe for drain, waste and vent applications.',
    tags: ['pvc', 'pipe', 'plumbing'],
    keywords: ['2 inch', '10 ft', 'drain'],
  },

  {
    id: 'electrical-wire-1',
    name: '12/2 Electrical Wire 250 ft',
    brand: 'AskKhan Electrical',
    category: 'Electrical',
    subcategory: 'Wire',
    sourcePrice: 129.99,
    rating: 4.8,
    stock: 80,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80',
    description:
      'Residential building wire for outlets, lighting and branch circuits.',
    tags: ['electrical wire', '12/2 wire', 'romex'],
    keywords: ['250 ft', 'electric', 'construction'],
  },

  {
    id: 'commercial-table-1',
    name: 'Commercial 6 ft Folding Table',
    brand: 'AskKhan Business',
    category: 'Commercial Furniture',
    subcategory: 'Tables',
    sourcePrice: 89.99,
    rating: 4.8,
    stock: 60,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    description:
      'Heavy-duty folding table for businesses, events, offices and commercial use.',
    tags: ['commercial table', 'folding table', 'business table'],
    keywords: ['6 ft', 'banquet', 'event table'],
  },

  {
    id: 'commercial-chair-1',
    name: 'Commercial Stackable Chair',
    brand: 'AskKhan Business',
    category: 'Commercial Furniture',
    subcategory: 'Chairs',
    sourcePrice: 49.99,
    rating: 4.7,
    stock: 100,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80',
    description:
      'Stackable chair for restaurants, offices, waiting rooms and event spaces.',
    tags: ['commercial chair', 'stackable chair', 'business chair'],
    keywords: ['restaurant', 'office', 'banquet'],
  },

  {
    id: 'office-chair-1',
    name: 'Ergonomic Business Office Chair',
    brand: 'AskKhan Business',
    category: 'Office & Business',
    subcategory: 'Office Chairs',
    sourcePrice: 179.99,
    rating: 4.8,
    stock: 70,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80',
    description:
      'Ergonomic adjustable office chair for professional and business use.',
    tags: ['office chair', 'business chair', 'desk chair'],
    keywords: ['ergonomic', 'commercial', 'executive'],
  },

  {
    id: 'bed-queen-1',
    name: 'Queen Platform Bed Frame',
    brand: 'AskKhan Home',
    category: 'Mattresses & Bedroom',
    subcategory: 'Beds',
    sourcePrice: 249.99,
    rating: 4.8,
    stock: 40,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description:
      'Modern queen platform bed with supportive slat system.',
    tags: ['queen bed', 'bed frame', 'platform bed'],
    keywords: ['bed', 'bedroom', 'queen'],
  },

  {
    id: 'mattress-queen-1',
    name: 'Queen 12 in Memory Foam Mattress',
    brand: 'AskKhan Sleep',
    category: 'Mattresses & Bedroom',
    subcategory: 'Mattresses',
    sourcePrice: 399.99,
    rating: 4.8,
    stock: 50,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description:
      '12-inch queen memory foam mattress with medium-firm support.',
    tags: ['queen mattress', 'memory foam mattress', 'mattress'],
    keywords: ['bed', 'sleep', '12 inch'],
  },

  {
    id: 'closet-1',
    name: 'Modular Closet Organizer System',
    brand: 'AskKhan Home',
    category: 'Closets & Storage',
    subcategory: 'Closet Systems',
    sourcePrice: 299.99,
    rating: 4.7,
    stock: 30,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',
    description:
      'Adjustable closet system with shelves, hanging space and storage.',
    tags: ['closet', 'closet organizer', 'wardrobe', 'storage'],
    keywords: ['shelves', 'bedroom', 'organization'],
  },

  {
    id: 'phone-1',
    name: '5G Unlocked Smartphone 256GB',
    brand: 'AskKhan Mobile',
    category: 'Phones & Tablets',
    subcategory: 'Smartphones',
    sourcePrice: 699.99,
    rating: 4.8,
    stock: 35,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    description:
      'Unlocked 5G smartphone with high-resolution display and 256GB storage.',
    tags: ['phone', 'smartphone', '5g phone', 'unlocked phone'],
    keywords: ['mobile', '256gb', 'electronics'],
  },

  {
    id: 'laptop-1',
    name: '15.6 in Business Laptop',
    brand: 'AskKhan Computing',
    category: 'Electronics & Computers',
    subcategory: 'Laptops',
    sourcePrice: 799.99,
    rating: 4.8,
    stock: 30,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
    description:
      'Professional laptop for office, school, business and everyday computing.',
    tags: ['laptop', 'business laptop', 'computer'],
    keywords: ['15.6', 'notebook', 'office', 'student'],
  },

  {
    id: 'gaming-laptop-1',
    name: '16 in Gaming Laptop',
    brand: 'AskKhan Gaming',
    category: 'Gaming',
    subcategory: 'Gaming Computers',
    sourcePrice: 1299.99,
    rating: 4.9,
    stock: 20,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80',
    description:
      'High-performance gaming laptop for modern PC games.',
    tags: ['gaming laptop', 'gaming pc', 'computer games'],
    keywords: ['gaming', 'laptop', 'pc'],
  },

  {
    id: 'game-console-1',
    name: '4K Gaming Console',
    brand: 'AskKhan Gaming',
    category: 'Gaming',
    subcategory: 'Consoles',
    sourcePrice: 499.99,
    rating: 4.9,
    stock: 30,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=900&q=80',
    description:
      'Modern game console supporting 4K gaming and online multiplayer.',
    tags: ['game console', 'video games', 'gaming'],
    keywords: ['console', 'games', '4k'],
  },

  {
    id: 'gaming-chair-1',
    name: 'Ergonomic Gaming Chair',
    brand: 'AskKhan Gaming',
    category: 'Gaming',
    subcategory: 'Gaming Furniture',
    sourcePrice: 199.99,
    rating: 4.8,
    stock: 45,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=900&q=80',
    description:
      'Adjustable high-back gaming chair with lumbar and neck support.',
    tags: ['gaming chair', 'computer chair', 'game chair'],
    keywords: ['gaming furniture', 'desk chair'],
  },

  {
    id: 'tv-1',
    name: '55 in 4K Smart TV',
    brand: 'AskKhan Electronics',
    category: 'Electronics & Computers',
    subcategory: 'Televisions',
    sourcePrice: 399.99,
    rating: 4.8,
    stock: 25,
    featured: true,
    image:
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80',
    description:
      '55-inch 4K smart television with streaming apps and HDR support.',
    tags: ['tv', 'television', 'smart tv', '4k tv'],
    keywords: ['55 inch', 'electronics', 'home entertainment'],
  },

  {
    id: 'refrigerator-1',
    name: 'French Door Refrigerator',
    brand: 'AskKhan Appliances',
    category: 'Appliances',
    subcategory: 'Refrigerators',
    sourcePrice: 1499.99,
    rating: 4.7,
    stock: 15,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=80',
    description:
      'Large-capacity French door refrigerator for home kitchens.',
    tags: ['refrigerator', 'fridge', 'appliance'],
    keywords: ['kitchen', 'french door', 'home appliance'],
  },

  {
    id: 'washer-1',
    name: 'High Efficiency Washing Machine',
    brand: 'AskKhan Appliances',
    category: 'Appliances',
    subcategory: 'Laundry',
    sourcePrice: 699.99,
    rating: 4.7,
    stock: 20,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=900&q=80',
    description:
      'High-efficiency washer with multiple wash cycles.',
    tags: ['washing machine', 'washer', 'laundry appliance'],
    keywords: ['appliance', 'home', 'laundry'],
  },

  {
    id: 'auto-toolset-1',
    name: 'Mechanics Tool Set 200 Piece',
    brand: 'AskKhan Auto',
    category: 'Automotive',
    subcategory: 'Automotive Tools',
    sourcePrice: 169.99,
    rating: 4.8,
    stock: 45,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=900&q=80',
    description:
      'Socket, wrench and ratchet set for automotive repair.',
    tags: ['mechanic tools', 'tool set', 'automotive tools'],
    keywords: ['socket', 'ratchet', 'wrench', 'car repair'],
  },

  {
    id: 'pressure-washer-1',
    name: 'Electric Pressure Washer',
    brand: 'AskKhan Outdoor',
    category: 'Garden & Patio',
    subcategory: 'Outdoor Power Equipment',
    sourcePrice: 199.99,
    rating: 4.7,
    stock: 25,
    featured: false,
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
    description:
      'Electric pressure washer for patios, siding, vehicles and outdoor cleaning.',
    tags: ['pressure washer', 'power washer', 'outdoor tools'],
    keywords: ['cleaning', 'patio', 'driveway'],
  },
]

export const products = rawProducts.map((product) => {
  const sourcePrice = Number(
    product.sourcePrice ?? product.price ?? 0
  )

  return {
    ...product,

    sourcePrice,

    price: Number(
      (sourcePrice * 1.1).toFixed(2)
    ),

    reviews: product.reviews ?? 0,

    color: product.color ?? '',

    details: product.details ?? [],

    brand:
      product.brand ||
      'AskKhan Marketplace',

    tags:
      product.tags ||
      [
        product.name,
        product.category,
        product.subcategory,
      ].filter(Boolean),

    keywords:
      product.keywords || [],
  }
})
