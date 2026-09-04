import http from 'http';

function testGet(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

function testPost(path, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request(`http://localhost:5000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log("=== Testing CSV Export Endpoints ===");
  
  const leadsExport = await testGet('/api/leads/export');
  console.log("GET /api/leads/export -> status:", leadsExport.statusCode, "Header:", leadsExport.headers['content-type']);
  console.log("CSV Preview:\n", leadsExport.data.slice(0, 150));

  const dealsExport = await testGet('/api/deals/export');
  console.log("\nGET /api/deals/export -> status:", dealsExport.statusCode, "Header:", dealsExport.headers['content-type']);
  console.log("CSV Preview:\n", dealsExport.data.slice(0, 150));

  const custExport = await testGet('/api/customers/export');
  console.log("\nGET /api/customers/export -> status:", custExport.statusCode, "Header:", custExport.headers['content-type']);
  console.log("CSV Preview:\n", custExport.data.slice(0, 150));

  console.log("\n=== Testing CSV Import Endpoints ===");
  const importLeadsRes = await testPost('/api/leads/import', {
    items: [
      { name: "Test Import Lead 1", phone: "+91 99999 11111", email: "import1@test.com", location: "Delhi", serviceInterest: "Web Dev" }
    ]
  });
  console.log("POST /api/leads/import -> status:", importLeadsRes.statusCode, "Response:", importLeadsRes.data);

  const importDealsRes = await testPost('/api/deals/import', {
    items: [
      { title: "Test Import Deal 1", dealValue: 45000, probability: 70, stage: "PROPOSAL" }
    ]
  });
  console.log("POST /api/deals/import -> status:", importDealsRes.statusCode, "Response:", importDealsRes.data);

  const importCustRes = await testPost('/api/customers/import', {
    items: [
      { name: "Test Import Customer 1", phone: "+91 88888 22222", email: "cust1@test.com", companyName: "Test Corp" }
    ]
  });
  console.log("POST /api/customers/import -> status:", importCustRes.statusCode, "Response:", importCustRes.data);
}

runTests().catch(console.error);
