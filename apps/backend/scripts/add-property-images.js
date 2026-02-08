#!/usr/bin/env node

/**
 * Script pour ajouter des URLs d'images aux propriétés existantes
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// URLs d'images de maisons/appartements (Unsplash - libres de droits)
const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop', // Appartement moderne
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=400&fit=crop', // Appartement avec balcon
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=400&fit=crop', // Salon moderne
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=400&fit=crop', // Cuisine moderne
  'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400&h=400&fit=crop', // Appartement design
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=400&fit=crop', // Maison moderne
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=400&fit=crop', // Maison avec jardin
];

async function addImagesToProperties() {
  try {
    console.log('📷 Ajout d\'images aux propriétés...\n');
    
    // Récupérer toutes les propriétés
    const properties = await prisma.property.findMany();
    
    if (properties.length === 0) {
      console.log('ℹ️  Aucune propriété trouvée dans la base de données');
      return;
    }
    
    console.log(`✅ ${properties.length} propriétés trouvées\n`);
    
    // Mettre à jour chaque propriété avec une image aléatoire
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      const imageUrl = PROPERTY_IMAGES[i % PROPERTY_IMAGES.length];
      
      await prisma.property.update({
        where: { id: property.id },
        data: { imageUrl }
      });
      
      console.log(`✅ ${property.reference} - ${property.address} → ${imageUrl.substring(0, 50)}...`);
    }
    
    console.log(`\n🎉 ${properties.length} propriétés mises à jour avec succès!`);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addImagesToProperties();
