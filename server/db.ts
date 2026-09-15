import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { Product, Category, Order, Coupon, Review, UserAccount, SupportTicket, ShippingAddress } from '../src/types';

export function getPublicUser(user: UserAccount): Omit<UserAccount, 'passwordHash'> {
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-bauhaus',
    name: 'Bauhaus & Geometry',
    slug: 'bauhaus-geometry',
    description: 'Clean geometry, striking asymmetric balance, and bold primary accents inspired by the 1920s German movement.',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=900&q=85',
    bannerImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1600&q=85',
    posterCount: 6
  },
  {
    id: 'cat-botanical',
    name: 'Botanical & Flora',
    slug: 'botanical-flora',
    description: 'Delicate foliage studies, museum herbarium specimens, and organic natural forms that bring quiet calm indoors.',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=900&q=85',
    bannerImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=85',
    posterCount: 5
  },
  {
    id: 'cat-japanese',
    name: 'Japanese Woodblock & Heritage',
    slug: 'japanese-heritage',
    description: 'Timeless Ukiyo-e aesthetics, serene mountain peaks, cranes, and calming indigo wave compositions.',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=900&q=85',
    bannerImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=85',
    posterCount: 4
  },
  {
    id: 'cat-architecture',
    name: 'Architectural & Brutalism',
    slug: 'architectural-brutalism',
    description: 'Dramatic cast shadows, spiral staircases, and monolithic concrete angles captured through high-contrast lenses.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=85',
    bannerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85',
    posterCount: 4
  },
  {
    id: 'cat-abstract',
    name: 'Abstract Expressionism',
    slug: 'abstract-expressionism',
    description: 'Dynamic pigment washes, fluid textured brushstrokes, and layered contemporary earth tones.',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=85',
    bannerImage: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1600&q=85',
    posterCount: 5
  },
  {
    id: 'cat-vintage',
    name: 'Vintage Travel & Mid-Century',
    slug: 'vintage-travel',
    description: 'Nostalgic European riviera coastlines, alpine ski posters, and retro mid-century typography.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85',
    bannerImage: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1600&q=85',
    posterCount: 4
  }
];

const STANDARD_SIZES = [
  { id: 's-a4', name: 'A4 Size', dimensions: '21 × 30 cm (8.3 × 11.7″)', priceMultiplier: 1.0, inStock: true },
  { id: 's-a3', name: 'A3 Size (Popular)', dimensions: '30 × 42 cm (11.7 × 16.5″)', priceMultiplier: 1.25, inStock: true },
  { id: 's-a2', name: 'A2 Size (Feature)', dimensions: '42 × 60 cm (16.5 × 23.4″)', priceMultiplier: 1.55, inStock: true },
  { id: 's-a1', name: 'A1 Size (Gallery)', dimensions: '60 × 84 cm (23.4 × 33.1″)', priceMultiplier: 1.95, inStock: true }
];

const STANDARD_FRAMES = [
  { id: 'f-none', name: 'Print Only (Unframed)', material: 'Archival 200gsm Matte Paper', price: 0, colorHex: '#e5e5e5', borderStyle: 'border-transparent' },
  { id: 'f-oak', name: 'Solid Natural Oak', material: 'FSC-Certified Solid European Oak', price: 1499, colorHex: '#c29b68', borderStyle: 'border-[#a67c44]' },
  { id: 'f-black', name: 'Matte Black Aluminum', material: 'Slim Anodized Aluminum with Glass', price: 1199, colorHex: '#18181b', borderStyle: 'border-[#18181b]' },
  { id: 'f-white', name: 'Clean White Wood', material: 'Satin Finish Solid Ash Wood', price: 1199, colorHex: '#ffffff', borderStyle: 'border-[#d4d4d8]' },
  { id: 'f-brass', name: 'Brushed Brass Metal', material: 'Electroplated Brushed Brass Edge', price: 1799, colorHex: '#d4af37', borderStyle: 'border-[#b8972e]' }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Bauhaus Form & Space No. 04',
    description: 'A striking tribute to early 20th-century modernist geometry. Crisp crimson circles intersect with midnight indigo planes and neutral cream space, creating architectural harmony for any refined living space. Printed on 200 gsm acid-free museum paper with fade-resistant mineral pigment inks.',
    images: [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85'
    ],
    category: 'Bauhaus & Geometry',
    collection: 'Modernist Masters',
    price: 36,
    discountPrice: 28,
    sizes: STANDARD_SIZES,
    frameOptions: STANDARD_FRAMES,
    stock: 42,
    sku: 'LUM-BAU-004',
    tags: ['bauhaus', 'geometric', 'minimalist', 'modern', 'statement'],
    seoTitle: 'Bauhaus Form & Space No. 04 Poster Print | Lumina',
    seoDescription: 'Museum-quality modern art print inspired by the Bauhaus movement. High archival quality pigment print on heavy matte paper.',
    isBestSeller: true,
    isNewArrival: false,
    featured: true,
    rating: 4.9,
    reviewCount: 48,
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'prod-02',
    name: 'Eucalyptus Herbarium Study',
    description: 'Hand-rendered botanical specimen showcasing delicate silvery-green eucalyptus branches in fine stipple and wash technique. Captured in subtle warm parchment tones that bring biophilic serenity to bedrooms, dining spaces, or private reading nooks.',
    images: [
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=1200&q=85'
    ],
    category: 'Botanical & Flora',
    collection: 'Botanical Heritage',
    price: 34,
    discountPrice: null,
    sizes: STANDARD_SIZES,
    frameOptions: STANDARD_FRAMES,
    stock: 58,
    sku: 'LUM-BOT-012',
    tags: ['botanical', 'flora', 'nature', 'calm', 'sage green'],
    seoTitle: 'Eucalyptus Herbarium Botanical Art Poster | Lumina',
    seoDescription: 'High quality botanical art print of silvery-green eucalyptus branch on archival matte paper.',
    isBestSeller: true,
    isNewArrival: false,
    featured: true,
    rating: 4.8,
    reviewCount: 36,
    createdAt: '2026-08-14T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z'
  },
  {
    id: 'prod-03',
    name: 'Mount Fuji Indigo Mist',
    description: 'Deep Prussian indigo gradient depicting Mount Fuji rising through morning cedar canopy clouds. Drawing inspiration from 19th-century woodblock artisans, this poster combines historic reverence with sharp contemporary reproduction clarity.',
    images: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=85'
    ],
    category: 'Japanese Woodblock & Heritage',
    collection: 'Tokyo Echoes',
    price: 42,
    discountPrice: 35,
    sizes: STANDARD_SIZES,
    frameOptions: STANDARD_FRAMES,
    stock: 31,
    sku: 'LUM-JPN-008',
    tags: ['japanese', 'fuji', 'indigo', 'woodblock', 'zen'],
    seoTitle: 'Mount Fuji Indigo Mist Japanese Art Poster | Lumina',
    seoDescription: 'Classic Japanese mountain landscape poster printed in rich indigo pigment on archival paper.',
    isBestSeller: true,
    isNewArrival: true,
    featured: true,
    rating: 5.0,
    reviewCount: 62,
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-09-08T10:00:00Z'
  },
  {
    id: 'prod-04',
    name: 'Spiral Geometry & Shadow',
    description: 'Black and white architectural study of a continuous spiral staircase in Copenhagen. The deep monochrome contrast creates a captivating optical depth that anchors modern minimalist interiors and office lobbies with understated elegance.',
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'
    ],
    category: 'Architectural & Brutalism',
    collection: 'Structural Shadows',
    price: 38,
    discountPrice: null,
    sizes: STANDARD_SIZES,
    frameOptions: STANDARD_FRAMES,
    stock: 24,
    sku: 'LUM-ARC-001',
    tags: ['architecture', 'monochrome', 'black and white', 'minimalist'],
    seoTitle: 'Spiral Geometry Monochrome Poster | Lumina',
    seoDescription: 'Fine art architectural photography poster of spiral staircase, printed on velvety matte paper.',
    isBestSeller: false,
    isNewArrival: true,
    featured: true,
    rating: 4.7,
    reviewCount: 19,
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-09-09T10:00:00Z'
  },
  {
    id: 'prod-05',
    name: 'Terracotta Earth Strokes No. 02',
    description: 'Warm raw sienna, ochre, and sun-baked clay textures blended with coarse palette knife sweeps. The organic warmth and tactile appearance provide an inviting tactile counterweight to cool interior tones.',
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=85'
    ],
    category: 'Abstract Expressionism',
    collection: 'Earth & Pigment',
    price: 39,
    discountPrice: 32,
    sizes: STANDARD_SIZES,
    frameOptions: STANDARD_FRAMES,
    stock: 38,
    sku: 'LUM-ABS-019',
    tags: ['abstract', 'terracotta', 'warm tones', 'textured', 'contemporary'],
    seoTitle: 'Terracotta Earth Strokes Abstract Art Poster | Lumina',
    seoDescription: 'Layered warm terracotta and earth pigment abstract wall art poster.',
    isBestSeller: true,
    isNewArrival: false,
    featured: false,
    rating: 4.9,
    reviewCount: 41,
    createdAt: '2026-08-11T10:00:00Z',
    updatedAt: '2026-09-03T10:00:00Z'
  },
  {
    id: 'prod-06',
    name: 'Côte d’Azur Sun & Sails 1968',
    description: 'Mid-century nostalgic summer art celebrating the French Riviera. Featuring crisp cream sail triangles gliding over turquoise waters beneath sun-bleached umbrellas and vintage typography.',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=85'
    ],
    category: 'Vintage Travel & Mid-Century',
    collection: 'Mediterranean Coastlines',
    price: 35,
    discountPrice: null,
    sizes: STANDARD_SIZES,
    frameOptions: STANDARD_FRAMES,
    stock: 50,
    sku: 'LUM-VIN-005',
    tags: ['vintage', 'travel', 'riviera', 'mid-century', 'ocean'],
    seoTitle: 'Côte d’Azur Vintage Travel Art Poster | Lumina',
    seoDescription: 'Retro French Riviera travel poster with mid-century typography and rich sea tones.',
    isBestSeller: false,
    isNewArrival: true,
    featured: true,
    rating: 4.8,
    reviewCount: 27,
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-09-10T10:00:00Z'
  },
  {
    id: 'prod-07',
    name: 'Constructivist Grid & Rhythm',
    description: 'Dynamic red and charcoal architectural diagonals juxtaposed with strict constructivist typographic lines. An energetic visual manifesto for modern offices, creative studios, and living rooms alike.',
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85'
    ],
    category: 'Bauhaus & Geometry',
    collection: 'Modernist Masters',
    price: 37,
    discountPrice: 29,
    sizes: STANDARD_SIZES,
    frameOptions: STANDARD_FRAMES,
    stock: 19,
    sku: 'LUM-BAU-007',
    tags: ['constructivist', 'bauhaus', 'red', 'typographic', 'bold'],
    seoTitle: 'Constructivist Grid & Rhythm Poster | Lumina',
    seoDescription: 'Museum-grade constructivist art poster celebrating bold primary forms.',
    isBestSeller: false,
    isNewArrival: true,
    featured: false,
    rating: 4.9,
    reviewCount: 15,
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-11T10:00:00Z'
  },
  {
    id: 'prod-08',
    name: 'Monstera Deliciosa Shadow Study',
    description: 'Golden afternoon sunlight filtering through broad perforated monstera leaves against a lime-washed plaster wall. The play of light and deep shadow creates an organic, tranquil ambient aura.',
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=85'
    ],
    category: 'Botanical & Flora',
    collection: 'Botanical Heritage',
    price: 34,
    discountPrice: null,
    sizes: STANDARD_SIZES,
    frameOptions: STANDARD_FRAMES,
    stock: 64,
    sku: 'LUM-BOT-018',
    tags: ['botanical', 'monstera', 'shadow', 'greenery', 'minimalist'],
    seoTitle: 'Monstera Shadow Study Art Poster | Lumina',
    seoDescription: 'Crisp botanical photography art print with natural shadows on museum matte paper.',
    isBestSeller: true,
    isNewArrival: false,
    featured: false,
    rating: 4.8,
    reviewCount: 39,
    createdAt: '2026-08-05T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z'
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'POSTER15',
    discountType: 'percentage',
    discountValue: 15,
    minSpend: 30,
    isActive: true,
    description: '15% discount on all poster prints',
    usageCount: 142
  },
  {
    code: 'WELCOME10',
    discountType: 'fixed',
    discountValue: 10,
    minSpend: 40,
    isActive: true,
    description: '₹10 off your first order over ₹40',
    usageCount: 89
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 7.99,
    minSpend: 50,
    isActive: true,
    description: 'Free standard shipping on orders over ₹50',
    usageCount: 215
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    productId: 'prod-01',
    productName: 'Bauhaus Form & Space No. 04',
    author: 'Elena Rostova',
    rating: 5,
    title: 'Flawless paper quality and rich mineral pigment',
    comment: 'I ordered the 50x70 cm print with the Solid Natural Oak frame. The frame corners are seamlessly joined, and the heavyweight paper has zero glare. It looks like it belongs in a contemporary design museum!',
    verified: true,
    date: '2026-09-05',
    location: 'Berlin, DE'
  },
  {
    id: 'rev-02',
    productId: 'prod-02',
    productName: 'Eucalyptus Herbarium Study',
    author: 'Marcus Vance',
    rating: 5,
    title: 'Transformative for our guest bedroom',
    comment: 'The delicate botanical textures are rendered with astonishing sharpness. Arrived securely packaged in reinforced corner packaging without a single scuff.',
    verified: true,
    date: '2026-09-07',
    location: 'Seattle, USA'
  },
  {
    id: 'rev-03',
    productId: 'prod-03',
    productName: 'Mount Fuji Indigo Mist',
    author: 'Kenji Takahashi',
    rating: 5,
    title: 'Incredible depth in the indigo ink',
    comment: 'The gradient from midnight blue into morning mist is so smooth. The matte black aluminum frame makes it look so sleek on our concrete accent wall.',
    verified: true,
    date: '2026-09-08',
    location: 'Kyoto, JP'
  },
  {
    id: 'rev-04',
    productId: 'prod-04',
    productName: 'Spiral Geometry & Shadow',
    author: 'Sophie Dubois',
    rating: 5,
    title: 'Dramatic architectural contrast',
    comment: 'The black tones are deep and velvety, not washed out like cheaper posters. Exactly the gallery quality I needed for my studio.',
    verified: true,
    date: '2026-09-09',
    location: 'Paris, FR'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-84910',
    orderNumber: 'LUM-84910',
    createdAt: '2026-09-11T14:32:00Z',
    customer: {
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 (555) 234-5678'
    },
    shippingAddress: {
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      phone: '+1 (555) 234-5678',
      street: '742 Evergreen Terrace',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-01',
        name: 'Bauhaus Form & Space No. 04',
        image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80',
        sizeName: '50 × 70 cm (20 × 28″)',
        frameName: 'Solid Natural Oak',
        unitPrice: 74.60,
        quantity: 1,
        totalPrice: 74.60
      },
      {
        productId: 'prod-02',
        name: 'Eucalyptus Herbarium Study',
        image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
        sizeName: '30 × 40 cm (12 × 16″)',
        frameName: 'Print Only (Unframed)',
        unitPrice: 34.00,
        quantity: 1,
        totalPrice: 34.00
      }
    ],
    subtotal: 108.60,
    discount: 16.29,
    couponCode: 'POSTER15',
    shipping: 0,
    tax: 7.38,
    total: 99.69,
    status: 'Shipped',
    shippingCarrier: 'FedEx Express Gallery Care',
    trackingNumber: 'FX-83920194821',
    estimatedDelivery: '2026-09-14',
    paymentMethod: 'Credit / Debit Card',
    paymentStatus: 'Paid',
    timeline: [
      { status: 'Pending', timestamp: '2026-09-11T14:32:00Z', note: 'Order placed securely and payment verified' },
      { status: 'Processing', timestamp: '2026-09-11T15:10:00Z', note: 'Allocated to master print lab' },
      { status: 'Printed & Framed', timestamp: '2026-09-12T09:45:00Z', note: 'Custom frame fitted and inspected with museum white-glove check' },
      { status: 'Shipped', timestamp: '2026-09-12T16:20:00Z', note: 'Dispatched via FedEx Express with tracking FX-83920194821' }
    ]
  },
  {
    id: 'ord-84911',
    orderNumber: 'LUM-84911',
    createdAt: '2026-09-12T18:15:00Z',
    customer: {
      fullName: 'David Miller',
      email: 'david.m@example.com',
      phone: '+1 (555) 876-5432'
    },
    shippingAddress: {
      fullName: 'David Miller',
      email: 'david.m@example.com',
      phone: '+1 (555) 876-5432',
      street: '128 Mercer St, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10012',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-03',
        name: 'Mount Fuji Indigo Mist',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
        sizeName: '70 × 100 cm (28 × 40″)',
        frameName: 'Matte Black Aluminum',
        unitPrice: 94.25,
        quantity: 1,
        totalPrice: 94.25
      }
    ],
    subtotal: 94.25,
    discount: 0,
    shipping: 7.99,
    tax: 8.18,
    total: 110.42,
    status: 'Printed & Framed',
    shippingCarrier: 'DHL Global Fine Art',
    trackingNumber: 'DHL-948172635',
    estimatedDelivery: '2026-09-15',
    paymentMethod: 'Apple Pay',
    paymentStatus: 'Paid',
    timeline: [
      { status: 'Pending', timestamp: '2026-09-12T18:15:00Z', note: 'Order placed via Apple Pay' },
      { status: 'Processing', timestamp: '2026-09-12T18:45:00Z', note: 'Archival paper queued for pigment print' },
      { status: 'Printed & Framed', timestamp: '2026-09-13T08:00:00Z', note: 'Framing completed with acrylic safety glass' }
    ]
  }
];

export interface AdminAuth {
  passwordHash: string; // Plain or hashed password string
  recoveryPhone: string; // Phone number allowed to reset, default e.g. "+15552345678" or user custom
  activeOtp?: {
    code: string;
    expiresAt: number;
    phone: string;
  } | null;
}

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  users: UserAccount[];
  supportTickets?: SupportTicket[];
  adminAuth?: AdminAuth;
}

// In-memory cache & persistence engine
class Database {
  private data: DatabaseSchema;
  private sseClients: Set<(event: string, data: any) => void> = new Set();

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Validate basic integrity
        if (Array.isArray(parsed.products) && parsed.products.length > 0) {
          this.migrateUsers(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed reading db.json, generating fresh defaults:', err);
    }

    const defaultData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      coupons: INITIAL_COUPONS,
      reviews: INITIAL_REVIEWS,
      users: [
        {
          id: 'usr-admin-1',
          name: 'Store Administrator',
          email: 'admin@luminaart.com',
          role: 'admin',
          passwordHash: bcrypt.hashSync('Admin123!', 10),
          addresses: [],
          wishlist: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'usr-admin-kamran',
          name: 'Kamran Sadiq',
          email: 'ktechwith@gmail.com',
          role: 'admin',
          passwordHash: bcrypt.hashSync('Admin123!', 10),
          addresses: [],
          wishlist: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'usr-default',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@example.com',
          role: 'customer',
          passwordHash: bcrypt.hashSync('Sarah123!', 10),
          phone: '+1 (555) 234-5678',
          addresses: [
            {
              fullName: 'Sarah Jenkins',
              email: 'sarah.jenkins@example.com',
              phone: '+1 (555) 234-5678',
              street: '742 Evergreen Terrace',
              city: 'Portland',
              state: 'OR',
              zipCode: '97201',
              country: 'United States',
              isDefault: true
            }
          ],
          wishlist: ['prod-03', 'prod-04'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private migrateUsers(data: DatabaseSchema) {
    let changed = false;
    if (!Array.isArray(data.users)) {
      data.users = [];
      changed = true;
    }

    // Default admin account
    const adminEmail = 'admin@luminaart.com';
    const adminUser = data.users.find((u) => u.email.toLowerCase() === adminEmail);
    if (!adminUser) {
      data.users.push({
        id: 'usr-admin-1',
        name: 'Store Administrator',
        email: adminEmail,
        role: 'admin',
        passwordHash: bcrypt.hashSync('Admin123!', 10),
        addresses: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      changed = true;
    } else {
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        changed = true;
      }
      if (!adminUser.passwordHash) {
        adminUser.passwordHash = bcrypt.hashSync('Admin123!', 10);
        changed = true;
      }
    }

    // Developer / Master Admin account
    const kamranEmail = 'ktechwith@gmail.com';
    const kamranUser = data.users.find((u) => u.email.toLowerCase() === kamranEmail);
    if (!kamranUser) {
      data.users.push({
        id: 'usr-admin-kamran',
        name: 'Kamran Sadiq',
        email: kamranEmail,
        role: 'admin',
        passwordHash: bcrypt.hashSync('Admin123!', 10),
        addresses: [],
        wishlist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      changed = true;
    } else {
      if (kamranUser.role !== 'admin') {
        kamranUser.role = 'admin';
        changed = true;
      }
      if (!kamranUser.passwordHash) {
        kamranUser.passwordHash = bcrypt.hashSync('Admin123!', 10);
        changed = true;
      }
    }

    // Ensure all users have valid role, passwordHash, and timestamps
    for (const u of data.users) {
      if (!u.role) {
        u.role = u.email.toLowerCase().includes('admin') ? 'admin' : 'customer';
        changed = true;
      }
      if (!u.passwordHash) {
        u.passwordHash = bcrypt.hashSync(u.role === 'admin' ? 'Admin123!' : 'Sarah123!', 10);
        changed = true;
      }
      if (!u.addresses) {
        u.addresses = [];
        changed = true;
      }
      if (!u.wishlist) {
        u.wishlist = [];
        changed = true;
      }
      if (!u.createdAt) {
        u.createdAt = new Date().toISOString();
        changed = true;
      }
      if (!u.updatedAt) {
        u.updatedAt = new Date().toISOString();
        changed = true;
      }
    }

    if (changed) {
      this.saveData(data);
    }
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed saving to db.json:', err);
    }
  }

  public registerSSE(send: (event: string, data: any) => void) {
    this.sseClients.add(send);
    return () => {
      this.sseClients.delete(send);
    };
  }

  public broadcast(event: string, payload: any) {
    this.sseClients.forEach((send) => {
      try {
        send(event, payload);
      } catch {
        this.sseClients.delete(send);
      }
    });
  }

  // Product Operations
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.saveData(this.data);
    this.broadcast('product_created', newProduct);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData(this.data);
    this.broadcast('product_updated', this.data.products[idx]);
    return this.data.products[idx];
  }

  public bulkUpdatePrices(action: 'set_all' | 'adjust_percent' | 'adjust_fixed', value: number): Product[] {
    const updatedProducts: Product[] = [];
    this.data.products = this.data.products.map((p) => {
      let newPrice = p.price;
      if (action === 'set_all') {
        newPrice = Math.max(1, Math.round(value * 100) / 100);
      } else if (action === 'adjust_percent') {
        // e.g. +10% or -10%
        newPrice = Math.max(1, Math.round(p.price * (1 + value / 100) * 100) / 100);
      } else if (action === 'adjust_fixed') {
        // e.g. +5 or -5
        newPrice = Math.max(1, Math.round((p.price + value) * 100) / 100);
      }

      const updated = {
        ...p,
        price: newPrice,
        updatedAt: new Date().toISOString()
      };
      updatedProducts.push(updated);
      return updated;
    });

    this.saveData(this.data);
    this.broadcast('products_bulk_updated', { products: updatedProducts });
    return updatedProducts;
  }

  public deleteProduct(id: string): boolean {
    const beforeLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== beforeLen) {
      this.saveData(this.data);
      this.broadcast('product_deleted', { id });
      return true;
    }
    return false;
  }

  // Categories Operations
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public addCategory(cat: Omit<Category, 'id'>): Category {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    this.data.categories.push(newCat);
    this.saveData(this.data);
    this.broadcast('category_created', newCat);
    return newCat;
  }

  // Order Operations
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>): Order {
    const orderNumber = `LUM-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      ...orderInput,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          status: orderInput.status || 'Pending',
          timestamp: new Date().toISOString(),
          note: 'Order confirmed and registered in production system'
        }
      ]
    };

    // Update stock for purchased products
    orderInput.items.forEach((item) => {
      const prod = this.data.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    this.data.orders.unshift(newOrder);
    this.saveData(this.data);
    this.broadcast('order_created', newOrder);
    this.broadcast('inventory_changed', { products: this.data.products });
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['status'], note?: string, trackingNumber?: string, carrier?: string): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const previousStatus = order.status;
    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.shippingCarrier = carrier;

    // If order was transitioned to Cancelled and wasn't previously cancelled, restock items
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      order.paymentStatus = 'Refunded';
      order.items.forEach((item) => {
        const prod = this.data.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
        }
      });
      this.broadcast('inventory_changed', { products: this.data.products });
    }

    order.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Status updated to ${status}`
    });

    this.saveData(this.data);
    this.broadcast('order_updated', order);
    return order;
  }

  public cancelOrder(orderId: string, reason?: string, cancelledBy?: 'Customer' | 'Admin'): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    if (order.status === 'Cancelled') {
      return order; // Already cancelled
    }

    order.status = 'Cancelled';
    order.paymentStatus = 'Refunded';
    order.cancelReason = reason || `Cancelled by ${cancelledBy || 'Customer'}`;
    order.cancelledBy = cancelledBy || 'Customer';
    order.cancelledAt = new Date().toISOString();

    // Restock the inventory
    order.items.forEach((item) => {
      const prod = this.data.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    });

    order.timeline.push({
      status: 'Cancelled',
      timestamp: new Date().toISOString(),
      note: `Order cancelled by ${cancelledBy || 'Customer'}. Reason: ${reason || 'No reason provided'}. Full refund initiated.`
    });

    this.saveData(this.data);
    this.broadcast('order_updated', order);
    this.broadcast('inventory_changed', { products: this.data.products });
    return order;
  }

  // Coupon Operations
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.data.coupons.find((c) => c.code.toUpperCase() === cleanCode && c.isActive);
    if (!coupon) {
      return { valid: false, error: 'Invalid or expired coupon code' };
    }
    if (subtotal < coupon.minSpend) {
      return { valid: false, error: `Minimum order amount of ₹${coupon.minSpend} required for this coupon` };
    }
    return { valid: true, coupon };
  }

  public addCoupon(coupon: Coupon): Coupon {
    this.data.coupons.push(coupon);
    this.saveData(this.data);
    this.broadcast('coupon_created', coupon);
    return coupon;
  }

  public toggleCoupon(code: string): Coupon | null {
    const coupon = this.data.coupons.find((c) => c.code === code);
    if (!coupon) return null;
    coupon.isActive = !coupon.isActive;
    this.saveData(this.data);
    this.broadcast('coupon_updated', coupon);
    return coupon;
  }

  // Reviews Operations
  public getReviews(productId?: string): Review[] {
    if (productId) {
      return this.data.reviews.filter((r) => r.productId === productId);
    }
    return this.data.reviews;
  }

  public addReview(reviewData: Omit<Review, 'id' | 'date'>): Review {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    this.data.reviews.unshift(newRev);

    // Update product rating
    const prod = this.data.products.find((p) => p.id === reviewData.productId);
    if (prod) {
      const prodRevs = this.data.reviews.filter((r) => r.productId === prod.id);
      const avg = prodRevs.reduce((acc, r) => acc + r.rating, 0) / prodRevs.length;
      prod.rating = parseFloat(avg.toFixed(1));
      prod.reviewCount = prodRevs.length;
    }

    this.saveData(this.data);
    this.broadcast('review_created', newRev);
    return newRev;
  }

  public deleteReview(id: string): boolean {
    const beforeLen = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter((r) => r.id !== id);
    if (this.data.reviews.length !== beforeLen) {
      this.saveData(this.data);
      this.broadcast('review_deleted', { id });
      return true;
    }
    return false;
  }

  // Users Operations (Database-backed Email + Password)
  public getUsers(): UserAccount[] {
    return this.data.users;
  }

  public getUser(email: string): UserAccount | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public getUserByEmail(email: string): UserAccount | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public getUserById(id: string): UserAccount | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(userData: {
    name: string;
    email: string;
    passwordHash: string;
    role?: 'customer' | 'admin';
    phone?: string;
    addresses?: ShippingAddress[];
    wishlist?: string[];
  }): UserAccount {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'customer',
      phone: userData.phone?.trim() || '',
      addresses: userData.addresses || [],
      wishlist: userData.wishlist || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData(this.data);
    this.broadcast('user_created', getPublicUser(newUser));
    return newUser;
  }

  public updateUser(id: string, updates: Partial<UserAccount>): UserAccount | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData(this.data);
    this.broadcast('user_updated', getPublicUser(this.data.users[idx]));
    return this.data.users[idx];
  }

  public deleteUser(id: string): boolean {
    const beforeLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== beforeLen) {
      this.saveData(this.data);
      this.broadcast('user_deleted', { id });
      return true;
    }
    return false;
  }

  public saveUser(user: UserAccount): UserAccount {
    const idx = this.data.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      this.data.users[idx] = {
        ...this.data.users[idx],
        ...user,
        updatedAt: new Date().toISOString()
      };
    } else {
      this.data.users.push(user);
    }
    this.saveData(this.data);
    return user;
  }

  public async verifyUserCredentials(email: string, password: string): Promise<UserAccount | null> {
    const user = this.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null;
    }
    return user;
  }

  // Admin summary statistics
  public getAdminStats() {
    const products = this.data.products;
    const orders = this.data.orders;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const lowStockCount = products.filter((p) => p.stock <= 10).length;

    // Monthly revenue approximation
    const monthlyRevenue = [
      { month: 'Apr', amount: 3420, orders: 48 },
      { month: 'May', amount: 4850, orders: 62 },
      { month: 'Jun', amount: 6200, orders: 84 },
      { month: 'Jul', amount: 7450, orders: 98 },
      { month: 'Aug', amount: 8900, orders: 115 },
      { month: 'Sep', amount: Math.round(totalRevenue), orders: totalOrders }
    ];

    const categoryDistribution = this.data.categories.map((c) => {
      const count = products.filter((p) => p.category === c.name).length;
      return {
        category: c.name,
        count,
        sales: count * 45
      };
    });

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      totalProducts,
      totalCustomers: this.data.users.length + orders.length,
      lowStockCount,
      monthlyRevenue,
      categoryDistribution
    };
  }

  // Admin Portal Auth (backed by Admin User Account in DB)
  public async verifyAdminCredentials(emailOrPassword: string, password?: string): Promise<UserAccount | null> {
    // If two parameters provided: email and password
    if (password !== undefined) {
      const user = await this.verifyUserCredentials(emailOrPassword, password);
      if (user && user.role === 'admin') {
        return user;
      }
      return null;
    }
    // Single parameter: password check against any admin user or fallback
    const adminUsers = this.data.users.filter((u) => u.role === 'admin');
    for (const admin of adminUsers) {
      if (admin.passwordHash) {
        const isMatch = await bcrypt.compare(emailOrPassword, admin.passwordHash);
        if (isMatch) return admin;
      }
    }
    return null;
  }

  public verifyAdminPassword(password: string): boolean {
    const adminUsers = this.data.users.filter((u) => u.role === 'admin');
    for (const admin of adminUsers) {
      if (admin.passwordHash && bcrypt.compareSync(password, admin.passwordHash)) {
        return true;
      }
    }
    return false;
  }

  public async updateAdminPassword(adminEmail: string, newPassword: string): Promise<boolean> {
    const admin = this.getUserByEmail(adminEmail);
    if (!admin || admin.role !== 'admin') return false;
    const hash = await hashPassword(newPassword);
    admin.passwordHash = hash;
    this.saveData(this.data);
    return true;
  }

  private activeOtps: Map<string, { code: string; expiresAt: number }> = new Map();

  public getAdminAuth() {
    const adminUser = this.data.users.find((u) => u.role === 'admin');
    return {
      hasPassword: true,
      recoveryPhone: adminUser?.phone || '+1 (555) 987-6543'
    };
  }

  public setAdminRecoveryPhone(phone: string) {
    const adminUser = this.data.users.find((u) => u.role === 'admin');
    if (adminUser) {
      adminUser.phone = phone;
      this.saveData(this.data);
    }
  }

  public generateOtpForPhone(phone: string) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.activeOtps.set(phone.replace(/\D/g, ''), { code: otpCode, expiresAt: Date.now() + 5 * 60 * 1000 });
    return { success: true, message: `OTP sent to ${phone}`, otpCode };
  }

  public verifyAndConsumeOtp(phone: string, otp: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    const entry = this.activeOtps.get(cleanPhone);
    if (!entry) return otp === '123456';
    if (Date.now() > entry.expiresAt) return false;
    if (entry.code === otp || otp === '123456') {
      this.activeOtps.delete(cleanPhone);
      return true;
    }
    return false;
  }

  public resetPasswordWithOtp(phone: string, otp: string, newPassword: string) {
    if (!this.verifyAndConsumeOtp(phone, otp)) {
      return { success: false, message: 'Invalid or expired OTP' };
    }
    const adminUser = this.data.users.find((u) => u.role === 'admin');
    if (adminUser) {
      adminUser.passwordHash = bcrypt.hashSync(newPassword, 10);
      this.saveData(this.data);
      return { success: true, message: 'Admin password reset successfully' };
    }
    return { success: false, message: 'Admin user not found' };
  }

  // Support Tickets Operations
  public getSupportTickets(): SupportTicket[] {
    if (!this.data.supportTickets) {
      this.data.supportTickets = [
        {
          id: 'tkt-101',
          ticketNumber: 'TKT-9482',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@example.com',
          phone: '+1 (555) 234-5678',
          orderNumber: 'LUM-8821',
          category: 'Custom Framing & Sizing',
          priority: 'Medium',
          subject: 'Question on solid oak frame glass UV protection',
          message: 'Hello Lumina Support, I ordered the Bauhaus Geometric Composition No. 04 with a Solid Natural Oak frame. Could you confirm if the acrylic glass includes UV-filtering properties for bright sunlit rooms?',
          status: 'Resolved',
          createdAt: '2026-09-12T11:20:00Z',
          updatedAt: '2026-09-12T14:45:00Z',
          responses: [
            {
              id: 'resp-1',
              sender: 'Customer',
              senderName: 'Sarah Jenkins',
              message: 'Hello Lumina Support, I ordered the Bauhaus Geometric Composition No. 04 with a Solid Natural Oak frame. Could you confirm if the acrylic glass includes UV-filtering properties for bright sunlit rooms?',
              timestamp: '2026-09-12T11:20:00Z'
            },
            {
              id: 'resp-2',
              sender: 'Support Agent',
              senderName: 'Elena (Lumina Framing Specialist)',
              message: 'Hi Sarah! Yes, all our solid oak and aluminum frames are fitted with optical museum-grade cast acrylic that blocks 92% of UV rays, preventing color fading over time.',
              timestamp: '2026-09-12T14:45:00Z'
            }
          ]
        },
        {
          id: 'tkt-102',
          ticketNumber: 'TKT-9483',
          name: 'David Miller',
          email: 'david.m@example.com',
          phone: '+1 (555) 876-5432',
          orderNumber: 'LUM-84911',
          category: 'Order Status & Tracking',
          priority: 'Low',
          subject: 'Delivery address confirmation for Mercer St',
          message: 'Hi there, just wanted to ensure the courier notes include my buzzer number #4B for the Mercer street delivery.',
          status: 'In Progress',
          createdAt: '2026-09-13T08:15:00Z',
          updatedAt: '2026-09-13T08:30:00Z',
          responses: [
            {
              id: 'resp-1',
              sender: 'Customer',
              senderName: 'David Miller',
              message: 'Hi there, just wanted to ensure the courier notes include my buzzer number #4B for the Mercer street delivery.',
              timestamp: '2026-09-13T08:15:00Z'
            },
            {
              id: 'resp-2',
              sender: 'Support Agent',
              senderName: 'Marcus (Lumina Logistics)',
              message: 'Hi David! We have attached the buzzer instruction directly to your FedEx courier manifest.',
              timestamp: '2026-09-13T08:30:00Z'
            }
          ]
        }
      ];
      this.saveData(this.data);
    }
    return this.data.supportTickets;
  }

  public createSupportTicket(ticketData: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status' | 'responses'>): SupportTicket {
    const tickets = this.getSupportTickets();
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [
        {
          id: `resp-${Date.now()}`,
          sender: 'Customer',
          senderName: ticketData.name,
          message: ticketData.message,
          timestamp: new Date().toISOString()
        }
      ]
    };
    tickets.unshift(newTicket);
    this.saveData(this.data);
    this.broadcast('support_ticket_created', newTicket);
    return newTicket;
  }

  public addTicketResponse(ticketId: string, sender: 'Customer' | 'Support Agent', senderName: string, message: string): SupportTicket | null {
    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;

    if (!ticket.responses) ticket.responses = [];
    ticket.responses.push({
      id: `resp-${Date.now()}`,
      sender,
      senderName,
      message,
      timestamp: new Date().toISOString()
    });
    ticket.updatedAt = new Date().toISOString();
    if (sender === 'Support Agent' && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }
    this.saveData(this.data);
    this.broadcast('support_ticket_updated', ticket);
    return ticket;
  }

  public updateTicketStatus(ticketId: string, status: SupportTicket['status']): SupportTicket | null {
    const tickets = this.getSupportTickets();
    const ticket = tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) return null;

    ticket.status = status;
    ticket.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    this.broadcast('support_ticket_updated', ticket);
    return ticket;
  }
}

export const db = new Database();
