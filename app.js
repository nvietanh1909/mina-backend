const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Cấu hình CORS
app.use(cors());

// Cấu hình body-parser
app.use(bodyParser.json());

// Định nghĩa một API đơn giản
app.get('/api/data', (req, res) => {
    res.json({ message: "Hello from Node.js backend!" });
});

// Lắng nghe yêu cầu
app.listen(5005, () => {
    console.log("Backend is running on port 5000");
});
