// اختبار الاتصال بين الفرونت إند والباك إند
// تشغيل: node test-connection.js

const API_BASE_URL = 'http://localhost:4000/api';

async function testConnection() {
  console.log('🧪 اختبار الاتصال بالباك إند\n');
  console.log(`📍 API: ${API_BASE_URL}\n`);
  
  const tests = [
    { name: 'Health Check', endpoint: '/health' },
    { name: 'Suppliers', endpoint: '/suppliers' },
    { name: 'Payments', endpoint: '/payments' }
  ];

  let results = { success: 0, warnings: 0, errors: 0 };

  for (const test of tests) {
    try {
      const response = await fetch(`${API_BASE_URL}${test.endpoint}`);
      const data = await response.json();

      if (response.ok) {
        console.log(`✅ ${test.name}: OK`);
        if (Array.isArray(data)) {
          console.log(`   عدد العناصر: ${data.length}`);
        }
        results.success++;
      } else {
        console.log(`⚠️  ${test.name}: ${response.status}`);
        console.log(`   ${data.error || data.message || 'خطأ غير معروف'}`);
        results.warnings++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log('   💡 تأكد من تشغيل السيرفر: cd server && npm run dev');
      }
      results.errors++;
    }
    console.log('');
  }

  console.log('═══════════════════════');
  console.log(`✅ نجح: ${results.success}`);
  console.log(`⚠️  تحذيرات: ${results.warnings}`);
  console.log(`❌ أخطاء: ${results.errors}`);
  console.log('═══════════════════════\n');
}

testConnection();



