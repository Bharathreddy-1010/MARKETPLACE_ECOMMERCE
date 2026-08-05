const bcrypt = require('bcryptjs');
const db = require('./database');

async function seed() {
  console.log('🌱 Seeding TexFlow database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // Demo Users
  const buyerUser = {
    id: 'user_buyer_1',
    name: 'Elena Rostova',
    email: 'buyer@demo.com',
    password: passwordHash,
    role: 'buyer',
    onboardingCompleted: true,
    company: 'Aura Couture Paris',
    createdAt: new Date().toISOString()
  };

  const supplierUser = {
    id: 'user_supplier_1',
    name: 'Rajesh Textiles',
    email: 'supplier@demo.com',
    password: passwordHash,
    role: 'supplier',
    onboardingCompleted: true,
    company: 'Apex Mills International',
    createdAt: new Date().toISOString()
  };

  const supplierUser2 = {
    id: 'user_supplier_2',
    name: 'Marco Bellini',
    email: 'bellini@demo.com',
    password: passwordHash,
    role: 'supplier',
    onboardingCompleted: true,
    company: 'Silken Aura Como',
    createdAt: new Date().toISOString()
  };

  // Demo Onboarding Profiles
  const buyerOnboarding = {
    userId: 'user_buyer_1',
    businessType: 'Luxury Fashion Brand',
    industry: 'Apparel & High Fashion',
    categoriesOfInterest: ['Silk', 'Organic Cotton', 'Linen', 'Velvet'],
    preferredFabricTypes: ['Woven', 'Knit', 'Jacquard'],
    typicalOrderQty: '500 - 2,000 meters',
    budgetRange: '$10,000 - $50,000 / order',
    sustainabilityFocus: true,
    notes: 'Focused on GOTS certified organic materials for Spring/Summer runway collection.'
  };

  const supplierOnboarding = {
    userId: 'user_supplier_1',
    businessName: 'Apex Mills International',
    businessType: 'Textile Manufacturer & Weaver',
    contactPerson: 'Rajesh Varma',
    phone: '+91 98765 43210',
    address: 'Sector 18, Textile Hub, Ahmedabad, Gujarat, India',
    operatingHours: 'Mon-Sat: 08:00 - 18:00 IST',
    categories: ['Organic Cotton', 'Linen Blend', 'Technical Spandex', 'Recycled Polyester'],
    fabricsOffered: ['Poplin', 'Twill', 'Canvas', 'Jersey', 'Ripstop'],
    minOrderQty: 100,
    certifications: ['GOTS', 'OEKO-TEX Standard 100', 'GRS (Global Recycled Standard)'],
    monthlyCapacity: '150,000 meters'
  };

  // 22 Realistic Textile Products
  const products = [
    {
      id: 'prod_1',
      supplierId: 'user_supplier_1',
      supplierName: 'Apex Mills International',
      name: 'GOTS Certified Organic Cotton Poplin',
      category: 'Cotton',
      description: 'Crisp, breathable 100% GOTS certified organic cotton poplin. Ideal for high-end dress shirts, summer dresses, and luxury linings.',
      price: 6.80,
      priceTiers: [
        { minQty: 100, price: 6.80 },
        { minQty: 500, price: 6.20 },
        { minQty: 2000, price: 5.50 }
      ],
      moq: 100,
      stock: 4500,
      unit: 'meter',
      gsm: 125,
      width: '148 cm (58")',
      weave: 'Plain Weave Poplin',
      fiberComposition: '100% Organic Cotton',
      colors: ['Optic White', 'Sky Blue', 'Charcoal Grey', 'Pastel Pink', 'Sage Green'],
      certifications: ['GOTS', 'OEKO-TEX Standard 100'],
      leadTimeDays: 7,
      countryOfOrigin: 'India',
      images: [
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      inStock: true
    },
    {
      id: 'prod_2',
      supplierId: 'user_supplier_2',
      supplierName: 'Silken Aura Como',
      name: 'Pure Mulberry Silk Charmeuse 19mm',
      category: 'Silk',
      description: 'Ultra-luxurious 19 momme Mulberry silk charmeuse with a luminous satin finish and fluid drape. Perfect for eveningwear, bridal, and lingerie.',
      price: 24.50,
      priceTiers: [
        { minQty: 50, price: 24.50 },
        { minQty: 200, price: 22.00 },
        { minQty: 1000, price: 19.80 }
      ],
      moq: 50,
      stock: 1200,
      unit: 'meter',
      gsm: 82,
      width: '140 cm (55")',
      weave: 'Satin Charmeuse',
      fiberComposition: '100% Grade 6A Mulberry Silk',
      colors: ['Ivory', 'Champagne Gold', 'Midnight Navy', 'Emerald Green', 'Ruby Red'],
      certifications: ['OEKO-TEX Standard 100'],
      leadTimeDays: 10,
      countryOfOrigin: 'Italy',
      images: [
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      inStock: true
    },
    {
      id: 'prod_3',
      supplierId: 'user_supplier_1',
      supplierName: 'Apex Mills International',
      name: 'Belgian Linen & Organic Cotton Slub Blend',
      category: 'Linen',
      description: 'Earthy, textured slub weave fabric combining natural European flax linen with organic cotton. Exceptional breathability and casual elegance.',
      price: 9.40,
      priceTiers: [
        { minQty: 100, price: 9.40 },
        { minQty: 500, price: 8.50 },
        { minQty: 1500, price: 7.80 }
      ],
      moq: 100,
      stock: 2800,
      unit: 'meter',
      gsm: 190,
      width: '150 cm (59")',
      weave: 'Slub Plain Weave',
      fiberComposition: '55% Linen, 45% Organic Cotton',
      colors: ['Natural Oat', 'Terracotta', 'Washed Denim', 'Olive Drab', 'Crisp White'],
      certifications: ['OEKO-TEX Standard 100', 'European Flax'],
      leadTimeDays: 12,
      countryOfOrigin: 'India',
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      inStock: true
    },
    {
      id: 'prod_4',
      supplierId: 'user_supplier_1',
      supplierName: 'Apex Mills International',
      name: 'Heavyweight Italian Merino Wool Flannel',
      category: 'Wool',
      description: 'Super 120s combed Australian merino wool tailored flannel with brushed surface feel. Engineered for winter suiting, overcoats, and luxury outerwear.',
      price: 32.00,
      priceTiers: [
        { minQty: 30, price: 32.00 },
        { minQty: 150, price: 28.50 },
        { minQty: 500, price: 25.00 }
      ],
      moq: 30,
      stock: 850,
      unit: 'meter',
      gsm: 340,
      width: '155 cm (61")',
      weave: '2/2 Twill Brushed Flannel',
      fiberComposition: '100% Extra Fine Merino Wool',
      colors: ['Heather Grey', 'Charcoal Melange', 'Camel', 'Navy Blue', 'Forest Green'],
      certifications: ['Woolmark Certified', 'Responsible Wool Standard'],
      leadTimeDays: 14,
      countryOfOrigin: 'Italy',
      images: [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      inStock: true
    },
    {
      id: 'prod_5',
      supplierId: 'user_supplier_1',
      supplierName: 'Apex Mills International',
      name: 'GRS Recycled Heavy Denim 14oz',
      category: 'Eco-Friendly',
      description: 'Durable 14oz selvedge denim crafted from 70% post-consumer recycled cotton and 30% organic cotton. Rich indigo shade with classic character.',
      price: 7.90,
      priceTiers: [
        { minQty: 200, price: 7.90 },
        { minQty: 1000, price: 7.10 }
      ],
      moq: 200,
      stock: 6000,
      unit: 'meter',
      gsm: 470,
      width: '150 cm (59")',
      weave: '3/1 Right Hand Twill',
      fiberComposition: '70% Recycled Cotton, 30% Organic Cotton',
      colors: ['Raw Deep Indigo', 'Washed Vintage Blue', 'Black Denim'],
      certifications: ['GRS (Global Recycled Standard)', 'GOTS'],
      leadTimeDays: 10,
      countryOfOrigin: 'India',
      images: [
        'https://images.unsplash.com/photo-1542272604-780c36856d67?auto=format&fit=crop&w=800&q=80'
      ],
      featured: false,
      inStock: true
    },
    {
      id: 'prod_6',
      supplierId: 'user_supplier_2',
      supplierName: 'Silken Aura Como',
      name: 'Silk Velvet with Rayon Pile',
      category: 'Velvet',
      description: 'Opulent silk-backed velvet with dense rayon pile creating a deep luster and buttery hand touch. Ideal for evening gowns and upholstery.',
      price: 28.00,
      priceTiers: [
        { minQty: 40, price: 28.00 },
        { minQty: 200, price: 25.00 }
      ],
      moq: 40,
      stock: 950,
      unit: 'meter',
      gsm: 290,
      width: '142 cm (56")',
      weave: 'Woven Pile Velvet',
      fiberComposition: '20% Silk Base, 80% Viscose Pile',
      colors: ['Deep Burgundy', 'Royal Blue', 'Onyx Black', 'Mustard Gold'],
      certifications: ['OEKO-TEX Standard 100'],
      leadTimeDays: 15,
      countryOfOrigin: 'Italy',
      images: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      inStock: true
    },
    {
      id: 'prod_7',
      supplierId: 'user_supplier_1',
      supplierName: 'Apex Mills International',
      name: 'Tencel Lyocell Micro-Modal Jersey',
      category: 'Eco-Friendly',
      description: 'Silky smooth stretch single jersey knit made from sustainably harvested eucalyptus wood pulp. Moisture-wicking and ultra-gentle on skin.',
      price: 8.20,
      priceTiers: [
        { minQty: 100, price: 8.20 },
        { minQty: 500, price: 7.40 }
      ],
      moq: 100,
      stock: 3500,
      unit: 'meter',
      gsm: 175,
      width: '160 cm (63")',
      weave: 'Single Jersey Knit',
      fiberComposition: '95% Tencel Lyocell, 5% Elastane',
      colors: ['Nude', 'Blush Pink', 'Dusty Cedar', 'Slate', 'Jet Black'],
      certifications: ['Lenzing Certified Tencel', 'OEKO-TEX Standard 100'],
      leadTimeDays: 8,
      countryOfOrigin: 'India',
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80'
      ],
      featured: false,
      inStock: true
    },
    {
      id: 'prod_8',
      supplierId: 'user_supplier_1',
      supplierName: 'Apex Mills International',
      name: 'CORDURA® 500D Waterproof Tactical Ripstop',
      category: 'Technical',
      description: 'High-tenacity nylon 6,6 Ripstop fabric with TPU waterproof coating. Engineered for outdoor gear, tactical apparel, luggage, and workwear.',
      price: 11.50,
      priceTiers: [
        { minQty: 100, price: 11.50 },
        { minQty: 500, price: 10.20 }
      ],
      moq: 100,
      stock: 5200,
      unit: 'meter',
      gsm: 240,
      width: '150 cm (59")',
      weave: 'Ripstop Grid',
      fiberComposition: '100% CORDURA Nylon 6,6',
      colors: ['Coyote Brown', 'Olive Camo', 'Stealth Black', 'Navy'],
      certifications: ['REACH Compliant', 'ISO 811 Waterproof'],
      leadTimeDays: 7,
      countryOfOrigin: 'South Korea',
      images: [
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
      ],
      featured: false,
      inStock: true
    },
    {
      id: 'prod_9',
      supplierId: 'user_supplier_2',
      supplierName: 'Silken Aura Como',
      name: 'Floral Metallic Silk Jacquard Brocade',
      category: 'Silk',
      description: 'Intricate dimensional floral pattern woven with silver and gold lurex threads on a rich silk ground. Designed for couture jackets and gowns.',
      price: 36.00,
      priceTiers: [
        { minQty: 30, price: 36.00 },
        { minQty: 100, price: 32.00 }
      ],
      moq: 30,
      stock: 420,
      unit: 'meter',
      gsm: 210,
      width: '140 cm (55")',
      weave: 'Complex Jacquard Weave',
      fiberComposition: '75% Silk, 20% Lurex Metallic, 5% Polyamide',
      colors: ['Gold & Midnight', 'Silver & Ivory', 'Rose Gold & Wine'],
      certifications: ['Made in Italy Quality Seal'],
      leadTimeDays: 14,
      countryOfOrigin: 'Italy',
      images: [
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
      ],
      featured: true,
      inStock: true
    },
    {
      id: 'prod_10',
      supplierId: 'user_supplier_1',
      supplierName: 'Apex Mills International',
      name: 'Eco Bamboo Viscose Satin',
      category: 'Eco-Friendly',
      description: 'Silky smooth biodegradable satin fabric with natural anti-bacterial qualities. High drape and thermal regulating comfort.',
      price: 7.60,
      priceTiers: [
        { minQty: 100, price: 7.60 },
        { minQty: 500, price: 6.90 }
      ],
      moq: 100,
      stock: 3100,
      unit: 'meter',
      gsm: 115,
      width: '145 cm (57")',
      weave: 'Satin Weave',
      fiberComposition: '100% Bamboo Viscose',
      colors: ['Lavender', 'Champagne', 'Mint Green', 'Cream'],
      certifications: ['OEKO-TEX Standard 100', 'FSC Certified Bamboo'],
      leadTimeDays: 7,
      countryOfOrigin: 'India',
      images: [
        'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80'
      ],
      featured: false,
      inStock: true
    }
  ];

  // Demo Orders
  const orders = [
    {
      id: 'ord_1001',
      buyerId: 'user_buyer_1',
      buyerName: 'Elena Rostova',
      buyerCompany: 'Aura Couture Paris',
      supplierId: 'user_supplier_1',
      supplierName: 'Apex Mills International',
      items: [
        {
          productId: 'prod_1',
          productName: 'GOTS Certified Organic Cotton Poplin',
          color: 'Sky Blue',
          quantity: 250,
          unitPrice: 6.20,
          totalPrice: 1550.00
        },
        {
          productId: 'prod_3',
          productName: 'Belgian Linen & Organic Cotton Slub Blend',
          color: 'Natural Oat',
          quantity: 150,
          unitPrice: 8.50,
          totalPrice: 1275.00
        }
      ],
      totalAmount: 2825.00,
      status: 'Preparing',
      shippingAddress: {
        street: '14 Rue du Faubourg Saint-Honoré',
        city: 'Paris',
        postalCode: '75008',
        country: 'France'
      },
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      history: [
        { status: 'Pending', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), note: 'Order placed by Buyer' },
        { status: 'Accepted', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), note: 'Supplier confirmed stock availability' },
        { status: 'Preparing', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), note: 'Fabric cutting and quality control in progress' }
      ]
    },
    {
      id: 'ord_1002',
      buyerId: 'user_buyer_1',
      buyerName: 'Elena Rostova',
      buyerCompany: 'Aura Couture Paris',
      supplierId: 'user_supplier_2',
      supplierName: 'Silken Aura Como',
      items: [
        {
          productId: 'prod_2',
          productName: 'Pure Mulberry Silk Charmeuse 19mm',
          color: 'Champagne Gold',
          quantity: 100,
          unitPrice: 22.00,
          totalPrice: 2200.00
        }
      ],
      totalAmount: 2200.00,
      status: 'Ready for Dispatch',
      shippingAddress: {
        street: '14 Rue du Faubourg Saint-Honoré',
        city: 'Paris',
        postalCode: '75008',
        country: 'France'
      },
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      history: [
        { status: 'Pending', timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), note: 'Order submitted' },
        { status: 'Accepted', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), note: 'Supplier approved roll allocation' },
        { status: 'Preparing', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), note: 'Inspection completed' },
        { status: 'Ready for Dispatch', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), note: 'Packed in humidity-controlled crate' }
      ]
    }
  ];

  const dbData = {
    users: [buyerUser, supplierUser, supplierUser2],
    onboarding_profiles: [buyerOnboarding, supplierOnboarding],
    products: products,
    orders: orders,
    cart: []
  };

  db.saveData(dbData);
  console.log(`✅ TexFlow database successfully seeded! (${products.length} products, 3 users, ${orders.length} orders)`);
}

seed().catch(err => {
  console.error('Error seeding data:', err);
});
