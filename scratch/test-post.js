async function testPost() {
  try {
    const res = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: 'T1',
        hotelId: 'SFB-99',
        items: [
          { id: 't1', quantity: 1, price: 12 }
        ]
      })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testPost();
