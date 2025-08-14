import connectDB from '@/lib/mongodb';
import { Product } from '@/models';

const sampleProducts = [
  // Sneakers
  {
    name: "Nike Air Max Classic",
    description: "Comfortable running sneakers with excellent cushioning and breathable design.",
    price: 150.00,
    image: "/assets/sneakers/image250.jpg",
    category: "sneakers",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "white", "red"],
    stock: 25,
    brand: "Nike",
    gender: "unisex"
  },
  {
    name: "Adidas Ultraboost Pro",
    description: "Premium running sneakers with responsive cushioning and energy return.",
    price: 180.00,
    image: "/assets/sneakers/image251.jpg",
    category: "sneakers",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5"],
    colors: ["black", "white", "blue"],
    stock: 30,
    brand: "Adidas",
    gender: "unisex"
  },
  {
    name: "Converse Chuck Taylor",
    description: "Classic casual sneakers perfect for everyday wear.",
    price: 65.00,
    image: "/assets/sneakers/image252.jpg",
    category: "sneakers",
    sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "white", "red", "navy"],
    stock: 40,
    brand: "Converse",
    gender: "unisex"
  },
  {
    name: "Vans Old Skool",
    description: "Iconic skate sneakers with durable construction and classic style.",
    price: 70.00,
    image: "/assets/sneakers/image253.jpg",
    category: "sneakers",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "white", "checkered"],
    stock: 35,
    brand: "Vans",
    gender: "unisex"
  },
  {
    name: "Jordan Air Classic",
    description: "Iconic basketball sneakers with premium leather and classic design.",
    price: 170.00,
    image: "/assets/sneakers/image254.jpg",
    category: "sneakers",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["black/red", "white/black", "royal blue"],
    stock: 22,
    brand: "Jordan",
    gender: "unisex"
  },
  {
    name: "Puma RS-X Retro",
    description: "Retro-inspired running sneakers with bold design and comfortable fit.",
    price: 110.00,
    image: "/assets/sneakers/image255.jpg",
    category: "sneakers",
    sizes: ["6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["white/blue", "black/yellow", "grey/orange"],
    stock: 32,
    brand: "Puma",
    gender: "unisex"
  },
  {
    name: "New Balance 990",
    description: "Premium running sneakers made with superior comfort and support.",
    price: 185.00,
    image: "/assets/sneakers/image256.jpg",
    category: "sneakers",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["grey", "navy", "black"],
    stock: 28,
    brand: "New Balance",
    gender: "unisex"
  },
  {
    name: "Reebok Classic Leather",
    description: "Timeless casual sneakers with soft leather upper and comfortable fit.",
    price: 75.00,
    image: "/assets/sneakers/image257.jpg",
    category: "sneakers",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["white", "black", "grey"],
    stock: 38,
    brand: "Reebok",
    gender: "unisex"
  },

  // Boots
  {
    name: "Dr. Martens 1460",
    description: "Classic leather boots with air-cushioned sole and durable construction.",
    price: 170.00,
    image: "/assets/boots/image250.jpg",
    category: "boots",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["black", "brown", "cherry red"],
    stock: 20,
    brand: "Dr. Martens",
    gender: "unisex"
  },
  {
    name: "Timberland 6-Inch Premium",
    description: "Waterproof leather boots perfect for outdoor activities and work.",
    price: 200.00,
    image: "/assets/boots/image251.jpg",
    category: "boots",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["wheat", "black", "brown"],
    stock: 18,
    brand: "Timberland",
    gender: "unisex"
  },
  {
    name: "Red Wing Iron Ranger",
    description: "Heritage work boots with premium leather and Goodyear welt construction.",
    price: 320.00,
    image: "/assets/boots/image252.jpg",
    category: "boots",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["amber", "black", "copper"],
    stock: 15,
    brand: "Red Wing",
    gender: "unisex"
  },
  {
    name: "UGG Classic Short",
    description: "Cozy sheepskin boots perfect for cold weather and casual wear.",
    price: 160.00,
    image: "/assets/boots/image254.jpg",
    category: "boots",
    sizes: ["5", "6", "7", "8", "9", "10", "11"],
    colors: ["chestnut", "black", "grey"],
    stock: 25,
    brand: "UGG",
    gender: "women"
  },
  {
    name: "Caterpillar Second Shift",
    description: "Steel toe work boots with slip-resistant sole and electrical hazard protection.",
    price: 140.00,
    image: "/assets/boots/image255.jpg",
    category: "boots",
    sizes: ["7", "8", "9", "10", "11", "12", "13"],
    colors: ["black", "brown"],
    stock: 22,
    brand: "Caterpillar",
    gender: "men"
  },

  // Sandals
  {
    name: "Birkenstock Arizona",
    description: "Classic two-strap sandals with contoured cork footbed for all-day comfort.",
    price: 135.00,
    image: "/assets/sandals/image250.jpg",
    category: "sandals",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["brown", "black", "white"],
    stock: 30,
    brand: "Birkenstock",
    gender: "unisex"
  },
  {
    name: "Teva Universal Trail",
    description: "Adventure-ready sandals with quick-dry webbing and rugged sole.",
    price: 70.00,
    image: "/assets/sandals/image251.jpg",
    category: "sandals",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["black", "navy", "olive"],
    stock: 25,
    brand: "Teva",
    gender: "unisex"
  },

  // Loafers
  {
    name: "Cole Haan Pinch Penny",
    description: "Classic leather penny loafers perfect for business casual and formal wear.",
    price: 180.00,
    image: "/assets/loafers/image250.jpeg",
    category: "formal",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["black", "brown", "cognac"],
    stock: 20,
    brand: "Cole Haan",
    gender: "men"
  },
  {
    name: "Sperry Top-Sider",
    description: "Classic boat shoes with non-slip sole and premium leather construction.",
    price: 95.00,
    image: "/assets/loafers/image251.jpeg",
    category: "casual",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["brown", "navy", "tan"],
    stock: 28,
    brand: "Sperry",
    gender: "unisex"
  },

  // Soccer Shoes
  {
    name: "Nike Mercurial Vapor",
    description: "Lightweight soccer cleats designed for speed and agility on the field.",
    price: 220.00,
    image: "/assets/soccer_shoes/image250.jpeg",
    category: "sports",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5"],
    colors: ["black", "white", "neon green"],
    stock: 18,
    brand: "Nike",
    gender: "unisex"
  },
  {
    name: "Adidas Predator Edge",
    description: "Control-focused soccer boots with textured upper for enhanced ball grip.",
    price: 200.00,
    image: "/assets/soccer_shoes/image251.jpeg",
    category: "sports",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5"],
    colors: ["black/red", "white/blue", "solar yellow"],
    stock: 20,
    brand: "Adidas",
    gender: "unisex"
  },

  // Additional products for pagination testing
  {
    name: "Nike Air Force 1",
    description: "Classic basketball sneakers with timeless design and comfort.",
    price: 90.00,
    image: "/assets/sneakers/image260.jpg",
    category: "sneakers",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["white", "black", "red"],
    stock: 45,
    brand: "Nike",
    gender: "unisex"
  },
  {
    name: "Adidas Stan Smith",
    description: "Minimalist tennis sneakers with clean white leather design.",
    price: 85.00,
    image: "/assets/sneakers/image261.jpg",
    category: "sneakers",
    sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["white/green", "white/navy", "white/black"],
    stock: 50,
    brand: "Adidas",
    gender: "unisex"
  },
  {
    name: "Vans Authentic",
    description: "Original skate shoes with waffle outsole and canvas upper.",
    price: 55.00,
    image: "/assets/sneakers/image262.jpg",
    category: "sneakers",
    sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "white", "navy", "red"],
    stock: 40,
    brand: "Vans",
    gender: "unisex"
  },
  {
    name: "Converse One Star",
    description: "Retro basketball sneakers with suede upper and star logo.",
    price: 75.00,
    image: "/assets/sneakers/image263.jpg",
    category: "sneakers",
    sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "white", "navy", "burgundy"],
    stock: 35,
    brand: "Converse",
    gender: "unisex"
  },
  {
    name: "Puma Suede Classic",
    description: "Iconic lifestyle sneakers with soft suede upper and classic styling.",
    price: 70.00,
    image: "/assets/sneakers/image264.jpg",
    category: "sneakers",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "red", "blue", "grey"],
    stock: 42,
    brand: "Puma",
    gender: "unisex"
  },
  {
    name: "Asics Gel-Lyte III",
    description: "Retro running sneakers with split tongue design and gel cushioning.",
    price: 120.00,
    image: "/assets/sneakers/image265.jpg",
    category: "sneakers",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5"],
    colors: ["grey/blue", "black/red", "white/green"],
    stock: 30,
    brand: "Asics",
    gender: "unisex"
  },

  // Flip Flops
  {
    name: "Havaianas Brazil Classic",
    description: "Original Brazilian flip flops with comfortable rubber sole and vibrant colors.",
    price: 25.00,
    image: "/assets/flip_flops/image250.jpeg",
  category: "sandals",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["blue", "black", "white", "red"],
    stock: 60,
    brand: "Havaianas",
    gender: "unisex"
  },
  {
    name: "Reef Fanning Bottle Opener",
    description: "Durable flip flops with built-in bottle opener in the sole.",
    price: 50.00,
    image: "/assets/flip_flops/image251.png",
  category: "sandals",
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["brown", "black", "grey"],
    stock: 45,
    brand: "Reef",
    gender: "men"
  },
  {
    name: "Rainbow Single Layer",
    description: "Premium leather flip flops that mold to your feet for custom comfort.",
    price: 45.00,
    image: "/assets/flip_flops/image252.jpeg",
  category: "sandals",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["brown", "black", "tan"],
    stock: 35,
    brand: "Rainbow",
    gender: "unisex"
  },

  // Additional Boots
  {
    name: "Wolverine 1000 Mile",
    description: "Heritage work boots with Horween leather and Goodyear welt construction.",
    price: 350.00,
    image: "/assets/boots/image256.jpg",
    category: "boots",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["brown", "black", "rust"],
    stock: 12,
    brand: "Wolverine",
    gender: "men"
  },
  {
    name: "Sorel Caribou",
    description: "Waterproof winter boots with removable felt liner for extreme cold weather.",
    price: 160.00,
    image: "/assets/boots/image258.jpeg",
    category: "boots",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["brown", "black", "grey"],
    stock: 20,
    brand: "Sorel",
    gender: "unisex"
  },
  {
    name: "Chelsea Boot Classic",
    description: "Elegant ankle boots with elastic side panels for easy slip-on wear.",
    price: 180.00,
    image: "/assets/boots/image259.jpeg",
    category: "boots",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "brown", "tan"],
    stock: 25,
    brand: "Generic",
    gender: "unisex"
  },

  // Additional Sandals
  {
    name: "Chaco Z/1 Classic",
    description: "Adventure sandals with LUVSEAT footbed and adjustable polyester straps.",
    price: 105.00,
    image: "/assets/sandals/image252.jpeg",
    category: "sandals",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["black", "brown", "navy"],
    stock: 28,
    brand: "Chaco",
    gender: "unisex"
  },
  {
    name: "Keen Newport H2",
    description: "Hybrid water sandals with toe protection and secure fit for outdoor adventures.",
    price: 120.00,
    image: "/assets/sandals/image253.jpeg",
    category: "sandals",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["black", "grey", "brown"],
    stock: 22,
    brand: "Keen",
    gender: "unisex"
  },

  // Additional Loafers
  {
    name: "Gucci Horsebit Loafer",
    description: "Luxury leather loafers with iconic horsebit detail and premium craftsmanship.",
    price: 680.00,
    image: "/assets/loafers/image252.jpeg",
    category: "formal",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "brown", "burgundy"],
    stock: 8,
    brand: "Gucci",
    gender: "men"
  },
  {
    name: "Clarks Wallabee",
    description: "Iconic moccasin-style shoes with crepe sole and suede upper.",
    price: 150.00,
    image: "/assets/loafers/image253.jpeg",
    category: "casual",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5"],
    colors: ["tan", "grey", "black"],
    stock: 30,
    brand: "Clarks",
    gender: "unisex"
  },

  // Additional Soccer Shoes
  {
    name: "Puma Future Z",
    description: "Innovative soccer boots with adaptive FUZIONFIT compression band.",
    price: 180.00,
    image: "/assets/soccer_shoes/image252.png",
    category: "sports",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["neon yellow", "black/orange", "white/blue"],
    stock: 16,
    brand: "Puma",
    gender: "unisex"
  },
  {
    name: "Under Armour Magnetico",
    description: "Precision soccer cleats with FormTrue upper for enhanced ball control.",
    price: 160.00,
    image: "/assets/soccer_shoes/image253.jpeg",
    category: "sports",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "white", "red"],
    stock: 19,
    brand: "Under Armour",
    gender: "unisex"
  }
];

export async function seedProducts() {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    
    console.log(`✅ Successfully seeded ${products.length} products`);
    return products;
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

// Run this function if called directly
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
