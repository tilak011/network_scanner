const express = require('express');
const MyAPI = require('./MyAPI');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', function(req, res) {
    // Requests from the same server don't have a HTTP_ORIGIN header
    req.headers['origin'] = req.headers['origin'] || req.headers['host'];
    
    const API = new MyAPI(req);
    try {
        const result = API.processAPI();
        res.status(result.status).json(result.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});