// ============================================================================
// TEST SCRIPT - Upload de document
// Teste l'endpoint POST /api/candidates/:id/documents
// ============================================================================

const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testUpload() {
  console.log('🧪 Test Upload de Document Swiss Safe\n');
  
  // 1. Créer un fichier de test PDF
  const testFilePath = path.join(__dirname, 'test-document.pdf');
  const testContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n%%EOF');
  fs.writeFileSync(testFilePath, testContent);
  console.log('✅ Fichier test créé:', testFilePath);
  
  // 2. Préparer le FormData
  const form = new FormData();
  form.append('file', fs.createReadStream(testFilePath), {
    filename: 'extrait-poursuites-test.pdf',
    contentType: 'application/pdf'
  });
  form.append('documentType', 'PURSUITS_EXTRACT');
  form.append('description', 'Test d\'upload depuis le script de diagnostic');
  
  // 3. Envoyer la requête (avec un ID candidat existant ou demo)
  const candidateId = 'demo-1'; // Adapter selon votre DB
  
  try {
    console.log(`\n📤 Envoi vers: ${API_URL}/api/candidates/${candidateId}/documents`);
    
    const response = await fetch(`${API_URL}/api/candidates/${candidateId}/documents`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    console.log('📊 Status:', response.status, response.statusText);
    
    const contentType = response.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('\n✅ Réponse JSON:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('\n❌ Réponse non-JSON (HTML?):', text.substring(0, 200));
    }
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  } finally {
    // Nettoyer
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Fichier test supprimé');
  }
}

testUpload();
