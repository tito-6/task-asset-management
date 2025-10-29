// Test the asset update API
const assetId = 14;
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImNvbXBhbnlJZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMwMTI0MDAwfQ.test"; // Replace with actual token

const testData = {
  type: "Web Sitesi",
  status: "Aktif",
  twoFactorStatus: "Yok",
  priority: "Medium"
};

console.log("Testing PUT /api/assets/" + assetId);
console.log("Request body:", JSON.stringify(testData, null, 2));

fetch(`http://localhost:4000/api/assets/${assetId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify(testData)
})
  .then(async (res) => {
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  })
  .catch((err) => {
    console.error("Error:", err);
  });
