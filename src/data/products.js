export const categories = [
  { name: 'Home', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80' },
  { name: 'Tech', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80' },
  { name: 'Style', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80' },
  { name: 'Wellness', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80' },
]

export const catalogCategories = [
  'Books',
  'Kids & Baby',
  'Clothing & Footwear',
  'Furniture & Home',
  'Electronics & Computers',
  'Toys & Games',
  'Rugs & Decor',
  'Tools & Hardware',
  'Construction Materials',
  'Health & OTC Medicines',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Garden & Patio',
  'Automotive',
  'Food & Grocery',
  'Pet Supplies',
  'Office & School',
  'Travel & Luggage',
]

const baseProducts = [
  {
    id: 1, name: 'Arc Lounge Chair', category: 'Home', price: 649, originalPrice: 760, rating: 4.9, reviews: 128, stock: 7, featured: true,
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=85',
    description: 'A sculptural lounge chair wrapped in cloud-soft ivory boucle. Its generous proportions and supportive curved back make slow mornings feel even better.',
    details: ['Textured performance boucle', 'Solid ash frame', 'Responsible foam filling', 'Ships fully assembled'], color: 'Natural ivory',
  },
  {
    id: 2, name: 'Studio Headphones', category: 'Tech', price: 189, rating: 4.8, reviews: 94, stock: 14, featured: true,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85',
    description: 'Immersive wireless sound in an understated matte finish. Designed with plush memory-foam cushions for all-day listening.',
    details: ['40-hour battery', 'Active noise cancellation', 'USB-C fast charge', 'Recycled aluminum'], color: 'Midnight black',
  },
  {
    id: 3, name: 'Terra Table Lamp', category: 'Home', price: 138, rating: 4.7, reviews: 62, stock: 9, featured: true,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85',
    description: 'Warm, diffused light from a hand-finished ceramic base and natural linen shade. A quietly beautiful addition to desks and nightstands.',
    details: ['Hand-finished ceramic', 'Linen shade', 'Warm LED bulb included', 'Inline dimmer'], color: 'Sandstone',
  },
  {
    id: 4, name: 'Everyday Carry Tote', category: 'Style', price: 84, rating: 4.9, reviews: 211, stock: 20, featured: true,
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=85',
    description: 'A clean-lined carryall made from buttery plant-based leather, with considered compartments for everything you bring along.',
    details: ['Plant-based leather', 'Padded laptop sleeve', 'Magnetic closure', 'Cotton lining'], color: 'Warm tan',
  },
  {
    id: 5, name: 'Ritual Stone Diffuser', category: 'Wellness', price: 96, rating: 4.6, reviews: 76, stock: 11, featured: false,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85',
    description: 'A minimal ultrasonic diffuser that turns essential oils into a fine, calming mist while doubling as an ambient light.',
    details: ['4-hour continuous mist', 'Automatic shutoff', 'Warm ambient light', 'Quiet operation'], color: 'Bone',
  },
  {
    id: 6, name: 'Linen Throw Blanket', category: 'Home', price: 112, rating: 4.8, reviews: 53, stock: 16, featured: false,
    image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=1200&q=85',
    description: 'A breathable, garment-washed linen throw with an inviting drape and softly fringed edges.',
    details: ['100% European linen', 'Garment washed', 'OEKO-TEX certified', 'Machine washable'], color: 'Moss',
  },
  {
    id: 7, name: 'Field Watch', category: 'Style', price: 229, rating: 4.7, reviews: 88, stock: 6, featured: false,
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85',
    description: 'A modern interpretation of the classic field watch with a crisp dial, brushed steel case and supple leather strap.',
    details: ['Japanese quartz movement', 'Sapphire crystal', '5 ATM water resistance', 'Italian leather strap'], color: 'Forest / tan',
  },
  {
    id: 8, name: 'Pocket Speaker', category: 'Tech', price: 79, rating: 4.5, reviews: 147, stock: 0, featured: false,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=85',
    description: 'Room-filling sound in a compact, travel-ready form with a tactile woven finish and simple one-touch controls.',
    details: ['12-hour battery', 'Water resistant', 'Stereo pairing', 'Bluetooth 5.3'], color: 'Charcoal',
  },
  {
    id: 9, name: 'Serein Eau de Parfum', category: 'Wellness', price: 124, rating: 4.9, reviews: 119, stock: 18, featured: false,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=85',
    description: 'An intimate woody fragrance with opening notes of bergamot, a green fig heart and a warm cedar finish.',
    details: ['50 ml', 'Vegan formula', 'Recyclable glass bottle', 'Small-batch blended'], color: 'Amber',
  },
  {
    id: 10, name: 'Ridge Desk Tray', category: 'Home', price: 58, rating: 4.6, reviews: 44, stock: 24, featured: false,
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85',
    description: 'A low-profile organizer milled from solid ash to gather your daily essentials with quiet intention.',
    details: ['Solid FSC ash', 'Natural oil finish', 'Non-slip cork base', 'Hand finished'], color: 'Natural ash',
  },
  {
    id: 11, name: 'Frame Sunglasses', category: 'Style', price: 116, rating: 4.8, reviews: 71, stock: 13, featured: false,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=85',
    description: 'Balanced acetate frames with softly squared lenses, made for comfortable everyday wear.',
    details: ['Bio-acetate frame', 'Polarized lenses', '100% UV protection', 'Case included'], color: 'Olive tortoise',
  },
  {
    id: 12, name: 'Orbit Keyboard', category: 'Tech', price: 149, rating: 4.7, reviews: 102, stock: 10, featured: false,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=85',
    description: 'A compact mechanical keyboard with a satisfying low-profile feel, wireless flexibility and a calm, neutral palette.',
    details: ['Hot-swappable switches', 'Multi-device Bluetooth', 'Backlit keys', 'Mac and Windows'], color: 'Stone',
  },
]
export const products = baseProducts.map(
  (product) => ({
    ...product,

    sourcePrice:
      product.sourcePrice ??
      product.price,

    price: Number(
      (
        Number(
          product.sourcePrice ??
            product.price
        ) * 1.1
      ).toFixed(2)
    ),

    brand:
      product.brand ||
      'AskKhan Marketplace',

    tags:
      product.tags || [
        product.name,
        product.category,
        product.color,
      ].filter(Boolean),
  })
)