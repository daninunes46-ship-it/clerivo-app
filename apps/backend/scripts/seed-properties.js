#!/usr/bin/env node

/**
 * Script pour créer des propriétés avec images et les lier aux applications
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Propriétés de test avec images
const TEST_PROPERTIES = [
  {
    reference: 'PROP-001',
    address: 'Attique Terrasse Lac',
    city: 'Lausanne',
    postalCode: '1003',
    canton: 'VD',
    propertyType: 'APARTMENT',
    rooms: 3.5,
    surfaceArea: 85,
    floor: 5,
    hasBalcony: true,
    hasParking: true,
    monthlyRent: 2800,
    charges: 250,
    deposit: 8400,
    status: 'AVAILABLE',
    description: 'Magnifique attique avec vue sur le lac',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop'
  },
  {
    reference: 'PROP-002',
    address: 'Appartement Centre-Ville',
    city: 'Genève',
    postalCode: '1200',
    canton: 'GE',
    propertyType: 'APARTMENT',
    rooms: 2.5,
    surfaceArea: 65,
    floor: 3,
    hasBalcony: false,
    hasParking: false,
    monthlyRent: 2200,
    charges: 180,
    deposit: 6600,
    status: 'AVAILABLE',
    description: 'Appartement lumineux en plein centre',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=400&fit=crop'
  },
  {
    reference: 'PROP-003',
    address: 'Villa Moderne',
    city: 'Montreux',
    postalCode: '1820',
    canton: 'VD',
    propertyType: 'HOUSE',
    rooms: 5.5,
    surfaceArea: 150,
    floor: 0,
    hasBalcony: true,
    hasParking: true,
    monthlyRent: 3500,
    charges: 300,
    deposit: 10500,
    status: 'AVAILABLE',
    description: 'Villa avec jardin et vue panoramique',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=400&fit=crop'
  }
];

async function seedProperties() {
  try {
    console.log('🏠 Création des propriétés avec images...\n');
    
    // Créer les propriétés
    const createdProperties = [];
    for (const propData of TEST_PROPERTIES) {
      const property = await prisma.property.create({
        data: propData
      });
      createdProperties.push(property);
      console.log(`✅ Créé: ${property.reference} - ${property.address}`);
    }
    
    console.log(`\n✅ ${createdProperties.length} propriétés créées\n`);
    
    // Récupérer les applications sans propriété
    const applications = await prisma.application.findMany({
      where: { propertyId: null },
      include: { candidate: true }
    });
    
    console.log(`📋 ${applications.length} applications à lier...\n`);
    
    // Lier chaque application à une propriété
    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const property = createdProperties[i % createdProperties.length];
      
      await prisma.application.update({
        where: { id: app.id },
        data: { propertyId: property.id }
      });
      
      console.log(`✅ ${app.candidate.firstName} ${app.candidate.lastName} → ${property.address}`);
    }
    
    console.log('\n🎉 Toutes les applications ont été liées aux propriétés!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedProperties();
