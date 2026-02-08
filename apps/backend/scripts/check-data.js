#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const candidatesCount = await prisma.candidate.count();
    const propertiesCount = await prisma.property.count();
    const applicationsCount = await prisma.application.count();
    
    console.log('📊 État de la base de données:');
    console.log(`   - Candidats: ${candidatesCount}`);
    console.log(`   - Propriétés: ${propertiesCount}`);
    console.log(`   - Applications: ${applicationsCount}`);
    
    if (candidatesCount > 0) {
      console.log('\n📋 Premiers candidats:');
      const candidates = await prisma.candidate.findMany({
        take: 5,
        include: {
          applications: {
            include: {
              property: true
            }
          }
        }
      });
      
      candidates.forEach(c => {
        console.log(`\n   ${c.firstName} ${c.lastName}`);
        console.log(`   Email: ${c.email}`);
        if (c.applications.length > 0) {
          const app = c.applications[0];
          console.log(`   Application: ${app.status}`);
          if (app.property) {
            console.log(`   Propriété: ${app.property.address} (${app.property.city})`);
            console.log(`   Image: ${app.property.imageUrl || 'Non définie'}`);
          } else {
            console.log(`   Propriété: Non liée (ID: ${app.propertyId})`);
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
