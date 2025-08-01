import connectDB from '@/lib/mongodb';
import { Product } from '@/models';

const sampleProducts = [
  {
    name: "Nike Air Max 270",
    description: "Comfortable running shoes with excellent cushioning and breathable design.",
    price: 150.00,
    image: "/images/nike-air-max-270.jpg",
    category: "running",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "white", "red"],
    stock: 25,
    brand: "Nike",
    gender: "unisex"
  },
  {
    name: "Adidas Ultraboost 22",
    description: "Premium running shoes with responsive cushioning and energy return.",
    price: 180.00,
    image: "/images/adidas-ultraboost-22.jpg",
    category: "running",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5"],
    colors: ["black", "white", "blue"],
    stock: 30,
    brand: "Adidas",
    gender: "unisex"
  },
  {
    name: "Converse Chuck Taylor All Star",
    description: "Classic casual sneakers perfect for everyday wear.",
    price: 65.00,
    image: "/images/converse-chuck-taylor.jpg",
    category: "casual",
    sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "white", "red", "navy"],
    stock: 40,
    brand: "Converse",
    gender: "unisex"
  },
  {
    name: "Vans Old Skool",
    description: "Iconic skate shoes with durable construction and classic style.",
    price: 70.00,
    image: "/images/vans-old-skool.jpg",
    category: "casual",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["black", "white", "checkered"],
    stock: 35,
    brand: "Vans",
    gender: "unisex"
  },
  {
    name: "Dr. Martens 1460",
    description: "Classic leather boots with air-cushioned sole and durable construction.",
    price: 170.00,
    image: "/images/dr-martens-1460.jpg",
    category: "boots",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    colors: ["black", "brown", "cherry red"],
    stock: 20,
    brand: "Dr. Martens",
    gender: "unisex"
  },
  {
    name: "New Balance 990v5",
    description: "Premium running shoes made in USA with superior comfort and support.",
    price: 185.00,
    image: "/images/new-balance-990v5.jpg",
    category: "running",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["grey", "navy", "black"],
    stock: 28,
    brand: "New Balance",
    gender: "unisex"
  },
  {
    name: "Jordan Air Jordan 1 Retro High",
    description: "Iconic basketball sneakers with premium leather and classic design.",
    price: 170.00,
    image: "/images/jordan-air-jordan-1.jpg",
    category: "sneakers",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["black/red", "white/black", "royal blue"],
    stock: 22,
    brand: "Jordan",
    gender: "unisex"
  },
  {
    name: "Puma RS-X",
    description: "Retro-inspired running shoes with bold design and comfortable fit.",
    price: 110.00,
    image: "/images/puma-rs-x.jpg",
    category: "sneakers",
    sizes: ["6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["white/blue", "black/yellow", "grey/orange"],
    stock: 32,
    brand: "Puma",
    gender: "unisex"
  },
  {
    name: "Timberland 6-Inch Premium Boot",
    description: "Waterproof leather boots perfect for outdoor activities and work.",
    price: 200.00,
    image: "/images/timberland-6-inch.jpg",
    category: "boots",
    sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12"],
    colors: ["wheat", "black", "brown"],
    stock: 18,
    brand: "Timberland",
    gender: "unisex"
  },
  {
    name: "Reebok Classic Leather",
    description: "Timeless casual sneakers with soft leather upper and comfortable fit.",
    price: 75.00,
    image: "/images/reebok-classic-leather.jpg",
    category: "casual",
    sizes: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
    colors: ["white", "black", "grey"],
    stock: 38,
    brand: "Reebok",
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
