import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🚀 Memulai Pengujian Menyeluruh Fitur Kelola VIP...\n');
  const results = [];

  // --- TES 1: Non-admin ditolak di endpoint admin ---
  try {
    const resGet = await fetch(`${BASE_URL}/api/admin/vip`);
    const resPost = await fetch(`${BASE_URL}/api/admin/vip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'flower', item_key: 'calla_white', is_vip: true }),
    });

    if (resGet.status === 401 && resPost.status === 401) {
      results.push({ test: 'Non-admin ditolak di endpoint admin (GET & POST 401)', status: 'LULUS' });
    } else {
      results.push({ test: 'Non-admin ditolak di endpoint admin', status: `GAGAL (GET: ${resGet.status}, POST: ${resPost.status})` });
    }
  } catch (err) {
    results.push({ test: 'Non-admin ditolak di endpoint admin', status: `ERROR: ${err.message}` });
  }

  // --- TES 2: Login Admin & Admin mengubah status VIP item (Tunggal & Bulk) ---
  let adminCookie = '';
  const adminKey = 'laysa-admin-s3cr3t-k3y-2026-buket';
  try {
    // 2a. Login Admin
    const loginRes = await fetch(`${BASE_URL}/api/admin/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: 'admin123' }), // PIN dari .env.local
    });

    const cookieHeader = loginRes.headers.get('set-cookie');
    if (cookieHeader) {
      adminCookie = cookieHeader.split(';')[0];
    }

    if (!adminCookie) {
      // Fallback with secret key header if PIN differs
      console.log('Login cookie not extracted, testing with direct admin session...');
    }

    // 2b. Admin Toggle Status VIP: Ubah 'chrysanthemum_pink' jadi VIP
    const updateRes1 = await fetch(`${BASE_URL}/api/admin/vip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        category: 'flower',
        item_key: 'chrysanthemum_pink',
        is_vip: true,
        item_name: 'Krisan Pink',
      }),
    });
    const updateData1 = await updateRes1.json();

    // 2c. Ambil status publik untuk verifikasi
    const publicRes1 = await fetch(`${BASE_URL}/api/vip/items`);
    const publicData1 = await publicRes1.json();
    const isVipNow = publicData1?.vipItems?.flower?.chrysanthemum_pink === true;

    // 2d. Ubah kembali 'chrysanthemum_pink' jadi non-VIP
    const updateRes2 = await fetch(`${BASE_URL}/api/admin/vip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        category: 'flower',
        item_key: 'chrysanthemum_pink',
        is_vip: false,
        item_name: 'Krisan Pink',
      }),
    });
    const updateData2 = await updateRes2.json();

    const publicRes2 = await fetch(`${BASE_URL}/api/vip/items`);
    const publicData2 = await publicRes2.json();
    const isNonVipNow = publicData2?.vipItems?.flower?.chrysanthemum_pink === false;

    if (updateRes1.ok && updateData1.success && isVipNow && updateRes2.ok && updateData2.success && isNonVipNow) {
      results.push({ test: 'Admin mengubah item jadi VIP lalu non-VIP', status: 'LULUS' });
    } else {
      results.push({
        test: 'Admin mengubah item jadi VIP lalu non-VIP',
        status: `GAGAL (res1: ${updateRes1.status}, isVipNow: ${isVipNow}, res2: ${updateRes2.status}, isNonVipNow: ${isNonVipNow})`,
      });
    }
  } catch (err) {
    results.push({ test: 'Admin mengubah item jadi VIP lalu non-VIP', status: `ERROR: ${err.message}` });
  }

  // --- TES 3: Pengguna non-VIP ditolak membuat link berisi item VIP ---
  try {
    // 3a. Test POST /api/b dengan buket VIP 'bucket-luxury-gold' tanpa kode VIP
    const resBuketVip = await fetch(`${BASE_URL}/api/b`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderName: 'Pengirim Uji',
        recipientName: 'Penerima Uji',
        message: 'Selamat hari bahagia!',
        designData: {
          bucketSize: 'bucket-luxury-gold', // Item VIP
          selectedFlowers: [
            { id: 'aster_purple', flowerId: 'aster_purple' },
          ],
        },
      }),
    });
    const dataBuketVip = await resBuketVip.json();

    // 3b. Test POST /api/gifts dengan bunga VIP 'calla_white' tanpa kode VIP
    const resGiftsVip = await fetch(`${BASE_URL}/api/gifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderName: 'Pengirim Uji',
        recipientName: 'Penerima Uji',
        message: 'Selamat hari bahagia!',
        designData: {
          bucketSize: 'bucket-1',
          selectedFlowers: [
            { id: 'calla_white', flowerId: 'calla_white' }, // Item VIP
          ],
        },
      }),
    });
    const dataGiftsVip = await resGiftsVip.json();

    const isRejectedB = resBuketVip.status === 403 && dataBuketVip.success === false && dataBuketVip.violations?.length > 0;
    const isRejectedGifts = resGiftsVip.status === 403 && dataGiftsVip.success === false && dataGiftsVip.violations?.length > 0;

    if (isRejectedB && isRejectedGifts) {
      results.push({
        test: 'Pengguna non-VIP ditolak membuat link berisi item VIP (HTTP 403)',
        status: 'LULUS',
      });
    } else {
      results.push({
        test: 'Pengguna non-VIP ditolak membuat link berisi item VIP',
        status: `GAGAL (statusB: ${resBuketVip.status}, statusGifts: ${resGiftsVip.status})`,
      });
    }
  } catch (err) {
    results.push({ test: 'Pengguna non-VIP ditolak membuat link berisi item VIP', status: `ERROR: ${err.message}` });
  }

  // --- TES 4: Pengguna non-VIP diizinkan membuat link jika item semua standar ---
  let createdShortId = '';
  try {
    const resValid = await fetch(`${BASE_URL}/api/b`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderName: 'Pengirim Standar',
        recipientName: 'Penerima Standar',
        message: 'Buket bunga indah untukmu!',
        designData: {
          bucketSize: 'bucket-1', // Non-VIP
          selectedFlowers: [
            { id: 'aster_purple', flowerId: 'aster_purple' }, // Non-VIP
            { id: 'chrysanthemum_pink', flowerId: 'chrysanthemum_pink' }, // Non-VIP
          ],
        },
      }),
    });
    const dataValid = await resValid.json();
    if (resValid.ok && dataValid.success && (dataValid.id || dataValid.shortId)) {
      createdShortId = dataValid.id || dataValid.shortId;
      results.push({ test: 'Pengguna non-VIP sukses membuat link berisi item standar', status: 'LULUS' });
    } else {
      results.push({ test: 'Pengguna non-VIP sukses membuat link berisi item standar', status: `GAGAL: ${dataValid.message}` });
    }
  } catch (err) {
    results.push({ test: 'Pengguna non-VIP sukses membuat link berisi item standar', status: `ERROR: ${err.message}` });
  }

  // --- TES 5: Link lama tetap terbuka bagi penerima ---
  try {
    if (createdShortId) {
      const resView = await fetch(`${BASE_URL}/b/${createdShortId}`);
      if (resView.status === 200) {
        results.push({ test: 'Link kado tetap terbuka bagi penerima (HTTP 200)', status: 'LULUS' });
      } else {
        results.push({ test: 'Link kado tetap terbuka bagi penerima', status: `GAGAL (status: ${resView.status})` });
      }
    } else {
      results.push({ test: 'Link kado tetap terbuka bagi penerima', status: 'TIDAK DIUJI (shortId tidak tersedia)' });
    }
  } catch (err) {
    results.push({ test: 'Link kado tetap terbuka bagi penerima', status: `ERROR: ${err.message}` });
  }

  // --- TES 6: Perubahan tampil di editor / public API setelah revalidate ---
  try {
    const resPub = await fetch(`${BASE_URL}/api/vip/items`);
    const pubData = await resPub.json();
    const cacheHeader = resPub.headers.get('cache-control');

    if (resPub.ok && pubData.success && pubData.vipItems && cacheHeader?.includes('s-maxage=60')) {
      results.push({ test: 'Endpoint publik VIP tersedia dengan cache header valid', status: 'LULUS' });
    } else {
      results.push({ test: 'Endpoint publik VIP tersedia dengan cache header valid', status: `GAGAL` });
    }
  } catch (err) {
    results.push({ test: 'Endpoint publik VIP tersedia dengan cache header valid', status: `ERROR: ${err.message}` });
  }

  console.log('--- REKAP HASIL PENGUJIAN ---');
  results.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.status}] ${r.test}`);
  });
}

runTests();
