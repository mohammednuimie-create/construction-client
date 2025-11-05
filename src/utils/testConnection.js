// ملف مساعد لاختبار الاتصال من الفرونت إند
// يمكن استخدامه في console المتصفح

import { suppliersAPI, paymentsAPI } from './api';

export async function testFrontendConnection() {
  console.log('🧪 بدء اختبار الاتصال من الفرونت إند...\n');
  
  const results = {
    suppliers: null,
    payments: null,
    errors: []
  };

  try {
    console.log('📡 جلب الموردين...');
    const suppliers = await suppliersAPI.getAll();
    console.log('✅ نجح جلب الموردين:', suppliers?.length || 0, 'مورد');
    results.suppliers = suppliers;
  } catch (error) {
    console.error('❌ فشل جلب الموردين:', error.message);
    results.errors.push({ type: 'suppliers', error: error.message });
  }

  try {
    console.log('📡 جلب المدفوعات...');
    const payments = await paymentsAPI.getAll();
    console.log('✅ نجح جلب المدفوعات:', payments?.length || 0, 'دفعة');
    results.payments = payments;
  } catch (error) {
    console.error('❌ فشل جلب المدفوعات:', error.message);
    results.errors.push({ type: 'payments', error: error.message });
  }

  console.log('\n📊 النتائج:', results);
  return results;
}

// للاستخدام في console المتصفح:
// import { testFrontendConnection } from './utils/testConnection';
// testFrontendConnection();



