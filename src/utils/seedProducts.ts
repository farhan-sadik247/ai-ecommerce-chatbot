import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();


import connectDB from '../lib/mongodb';
import { Product } from '../models';
import fs from 'fs';
import path from 'path';

const categoryMap: { [key: string]: string } = {
  'boots': 'boots',
  'flip_flops': 'casual',
  'loafers': 'formal',
  'sandals': 'sandals',
  'sneakers': 'sneakers',
  'soccer_shoes': 'sports'
};

const brands = ["Nike", "Adidas", "Puma", "Reebok", "New Balance", "Vans", "Converse", "Under Armour", "Asics"];

export async function seedProducts() {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    
    const assetsDir = path.join(process.cwd(), 'public', 'assets');
    const folders = fs.readdirSync(assetsDir);
    
    const productsToInsert: any[] = [];
    
    for (const folder of folders) {
      const folderPath = path.join(assetsDir, folder);
      
      // Check if it's a directory
      if (fs.statSync(folderPath).isDirectory()) {
        const files = fs.readdirSync(folderPath).filter(f => f.match(/\.(jpg|jpeg|png|svg|gif|webp|avif)$/i));
        
        const mappedCategory = categoryMap[folder] || 'casual';
        const displayCategory = folder.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        files.forEach((file, index) => {
          const randomBrand = brands[Math.floor(Math.random() * brands.length)];
          const randomPrice = Math.floor(Math.random() * (250 - 50 + 1) + 50); // between 50 and 250
          const randomStock = Math.floor(Math.random() * (100 - 10 + 1) + 10); // between 10 and 100
          
          productsToInsert.push({
            name: `${randomBrand} ${displayCategory} Model ${index + 1}`,
            description: `High-quality ${displayCategory.toLowerCase()} perfect for any occasion. Provides excellent comfort and durability.`,
            price: randomPrice,
            image: `/assets/${folder}/${file}`,
            category: mappedCategory,
            sizes: ["7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11"],
            stock: randomStock,
            brand: randomBrand,
          });
        });
      }
    }
    
    console.log(`Found ${productsToInsert.length} images to seed.`);
    
    // Insert products
    const products = await Product.insertMany(productsToInsert);
    
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
