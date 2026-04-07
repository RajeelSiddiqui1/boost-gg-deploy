const axios = require('axios');

async function testServiceSave() {
    try {
        const payload = {
            name: "Test Service Debuging",
            slug: "test-service-debugging",
            gameId: "64b8e2b8b9a7c3d2e1f4a5b6",
            categoryId: "64b8e2b8b9a7c3d2e1f4a5b6",
            description: "A test description",
            shortDescription: "Short test",
            basePrice: 10,
            status: "active",
            serviceType: "boosting",
            pricing: {
                basePrice: 10,
                type: 'fixed'
            }
        };

        console.log("Sending payload...");
        const res = await axios.post('http://localhost:5000/api/v1/services/admin', payload);
        console.log("Success:", res.data);
    } catch (error) {
        console.error("HTTP ERROR:", error.response?.status, error.response?.data);
    }
}

testServiceSave();
