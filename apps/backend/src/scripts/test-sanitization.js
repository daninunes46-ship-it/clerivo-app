/**
 * 🧪 SCRIPT DE TEST - SANITIZATION HTML
 * Valide que la fonction sanitizeEmailHTML bloque correctement les attaques XSS
 */

const { sanitizeEmailHTML } = require('../services/imapService');

console.log('\n🛡️  TEST DE SÉCURITÉ - SANITIZATION HTML\n');
console.log('='.repeat(60));

const testCases = [
  {
    name: '❌ Script basique',
    input: '<p>Bonjour</p><script>alert("XSS")</script>',
    shouldContain: '<p>Bonjour</p>',
    shouldNotContain: '<script>'
  },
  {
    name: '❌ Événement onclick',
    input: '<a href="#" onclick="alert(\'XSS\')">Cliquez ici</a>',
    shouldContain: 'Cliquez ici',
    shouldNotContain: 'onclick'
  },
  {
    name: '❌ Iframe malveillant',
    input: '<p>Test</p><iframe src="https://evil.com"></iframe>',
    shouldContain: '<p>Test</p>',
    shouldNotContain: '<iframe>'
  },
  {
    name: '❌ Image avec onerror',
    input: '<img src="x" onerror="alert(\'XSS\')">',
    shouldContain: '<img',
    shouldNotContain: 'onerror'
  },
  {
    name: '✅ Image légitime',
    input: '<img src="https://example.com/logo.png" alt="Logo" width="200">',
    shouldContain: '<img',
    shouldContain2: 'src=',
    shouldContain3: 'alt='
  },
  {
    name: '✅ Lien hypertexte',
    input: '<a href="https://example.com">Site web</a>',
    shouldContain: '<a',
    shouldContain2: 'href=',
    shouldContain3: 'Site web'
  },
  {
    name: '✅ Formatage texte',
    input: '<p><strong>Gras</strong> et <em>italique</em></p>',
    shouldContain: '<strong>',
    shouldContain2: '<em>',
    shouldContain3: 'Gras'
  },
  {
    name: '❌ Form injection',
    input: '<form action="/hack"><input type="text" name="data"></form>',
    shouldNotContain: '<form>',
    shouldNotContain2: '<input>'
  }
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log('-'.repeat(60));
  
  const result = sanitizeEmailHTML(test.input);
  
  console.log(`📥 Input:  ${test.input}`);
  console.log(`📤 Output: ${result || '(vide)'}`);
  
  let testPassed = true;
  
  // Vérifications "should contain"
  if (test.shouldContain && !result.includes(test.shouldContain)) {
    console.log(`   ❌ ÉCHEC: Devrait contenir "${test.shouldContain}"`);
    testPassed = false;
  }
  if (test.shouldContain2 && !result.includes(test.shouldContain2)) {
    console.log(`   ❌ ÉCHEC: Devrait contenir "${test.shouldContain2}"`);
    testPassed = false;
  }
  if (test.shouldContain3 && !result.includes(test.shouldContain3)) {
    console.log(`   ❌ ÉCHEC: Devrait contenir "${test.shouldContain3}"`);
    testPassed = false;
  }
  
  // Vérifications "should NOT contain"
  if (test.shouldNotContain && result.includes(test.shouldNotContain)) {
    console.log(`   ❌ ÉCHEC: NE devrait PAS contenir "${test.shouldNotContain}"`);
    testPassed = false;
  }
  if (test.shouldNotContain2 && result.includes(test.shouldNotContain2)) {
    console.log(`   ❌ ÉCHEC: NE devrait PAS contenir "${test.shouldNotContain2}"`);
    testPassed = false;
  }
  
  if (testPassed) {
    console.log('   ✅ PASSÉ');
    passedTests++;
  } else {
    failedTests++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 RÉSULTAT FINAL: ${passedTests}/${testCases.length} tests réussis`);

if (failedTests === 0) {
  console.log('\n🎉 TOUS LES TESTS SONT PASSÉS ! 🛡️');
  console.log('✅ La sanitization HTML est opérationnelle et sécurisée.\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${failedTests} test(s) échoué(s). Veuillez vérifier la configuration.\n`);
  process.exit(1);
}
