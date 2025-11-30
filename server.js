const express = require('express');
const app = express();
app.use(express.json());

let deviceData = {
    temperature: 0,
    relay1: false,
    relay2: false
};

// ESP8266 داده می‌فرسته
app.post('/data', (req, res) => {
    deviceData = req.body;
    res.send('OK');
});

// وب سایت داده می‌گیره
app.get('/status', (req, res) => {
    res.json(deviceData);
});

// وب سایت رله رو کنترل می‌کنه
app.post('/control', (req, res) => {
    if(req.body.relay1 !== undefined) {
        deviceData.relay1 = req.body.relay1;
    }
    res.send('OK');
});

app.listen(3000, () => {
    console.log('Server started!');
});
