const API_URL = 'http://localhost:3001/nurse';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAPI(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error ${method} ${endpoint}: ${response.status} - ${errorText}`);
      return null;
    }
    const data = await response.json();
    console.log(`✅ Success ${method} ${endpoint}`);
    return data;
  } catch (error) {
    console.error(`❌ Fetch Failed ${method} ${endpoint}:`, error.message);
    return null;
  }
}

async function runTest() {
  console.log('🚀 เริ่มยิง API เพื่อสร้างข้อมูลจำลอง...\n');

  // 1. Create Ward
  console.log('🏥 1. สร้างแผนก (Ward)');
  const ward = await fetchAPI('/wards', 'POST', {
    name: 'ICU (Intensive Care Unit)',
    code: 'ICU',
    color: '#ef4444',
    description: 'แผนกผู้ป่วยวิกฤต',
  });
  if (!ward) return;

  // 2. Create Shift Types
  console.log('\n⏰ 2. สร้างประเภทกะเวร (Shift Types)');
  const morningShift = await fetchAPI('/shift-types', 'POST', {
    name: 'เวรเช้า',
    code: 'M',
    startTime: '08:00',
    endTime: '16:00',
    durationHours: 8,
    color: '#f59e0b',
  });

  const afternoonShift = await fetchAPI('/shift-types', 'POST', {
    name: 'เวรบ่าย',
    code: 'A',
    startTime: '16:00',
    endTime: '00:00',
    durationHours: 8,
    color: '#3b82f6',
  });

  const nightShift = await fetchAPI('/shift-types', 'POST', {
    name: 'เวรดึก',
    code: 'N',
    startTime: '00:00',
    endTime: '08:00',
    durationHours: 8,
    color: '#6366f1',
  });

  if (!morningShift || !afternoonShift || !nightShift) return;

  // 3. Create Nurses
  console.log('\n👩‍⚕️ 3. สร้างข้อมูลพยาบาล (Nurses)');
  const nurse1 = await fetchAPI('/nurses', 'POST', {
    employeeId: 'NRS-001',
    firstName: 'สมหญิง',
    lastName: 'ใจดี',
    position: 'RN',
    wardId: ward.id,
    phone: '0812345678',
  });

  const nurse2 = await fetchAPI('/nurses', 'POST', {
    employeeId: 'NRS-002',
    firstName: 'สุดา',
    lastName: 'รักษ์โลก',
    position: 'RN',
    wardId: ward.id,
    phone: '0898765432',
  });

  if (!nurse1 || !nurse2) return;

  // 4. Create Schedule
  console.log('\n📅 4. สร้างตารางเวร (Schedules)');
  const scheduleEntries = [
    { nurseId: nurse1.id, date: '2026-05-01T00:00:00Z', type: 'SHIFT', shiftTypeId: morningShift.id },
    { nurseId: nurse1.id, date: '2026-05-02T00:00:00Z', type: 'SHIFT', shiftTypeId: afternoonShift.id },
    { nurseId: nurse1.id, date: '2026-05-03T00:00:00Z', type: 'OFF' },
    { nurseId: nurse2.id, date: '2026-05-01T00:00:00Z', type: 'SHIFT', shiftTypeId: nightShift.id },
    { nurseId: nurse2.id, date: '2026-05-02T00:00:00Z', type: 'OFF' },
    { nurseId: nurse2.id, date: '2026-05-03T00:00:00Z', type: 'SHIFT', shiftTypeId: morningShift.id },
  ];

  const schedule = await fetchAPI('/schedules', 'POST', {
    wardId: ward.id,
    year: 2026,
    month: 5,
    entries: scheduleEntries,
  });

  // Publish Schedule
  if (schedule) {
    await fetchAPI(`/schedules/${schedule.id}/publish`, 'PATCH');
  }

  // 5. Add Colleague
  console.log('\n🤝 5. เพิ่มเพื่อนร่วมงาน (Colleagues)');
  await fetchAPI('/colleagues', 'POST', {
    followerId: nurse1.id,
    followingId: nurse2.id,
    nickname: 'พี่สุดา',
  });

  // 6. Test Get Calendar View
  console.log('\n🔍 6. ทดสอบเรียกดูภาพรวมตารางตึก (Calendar View)');
  await fetchAPI(`/schedules?wardId=${ward.id}&year=2026&month=5`, 'GET');

  console.log('\n🎉 สร้างข้อมูล Test สำเร็จเรียบร้อยแล้ว!');
}

runTest();
