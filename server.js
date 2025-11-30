const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ذخیره‌سازی داده‌ها
let deviceData = {
    temperature: 0,
    relay1: false,
    relay2: false,
    buttons: [false, false, false, false, false]
};

let pendingCommands = [];

// ✅ آدرس‌های ساده‌تر - درست مثل کد Arduino
app.post('/data', (req, res) => {
    console.log('📨 Data received:', req.body);
    deviceData = {...deviceData, ...req.body};
    res.json({status: "success", message: "Data received"});
});

app.get('/status', (req, res) => {
    console.log('📊 Status requested');
    res.json(deviceData);
});

app.get('/commands', (req, res) => {
    console.log('📥 Commands requested');
    const commands = [...pendingCommands];
    pendingCommands = []; // پاک کردن پس از ارسال
    res.json({commands: commands});
});

app.post('/control', (req, res) => {
    console.log('🎛️ Control command:', req.body);
    
    if(req.body.relay1 !== undefined) {
        pendingCommands.push({
            command: "relay1", 
            value: req.body.relay1
        });
    }
    if(req.body.relay2 !== undefined) {
        pendingCommands.push({
            command: "relay2",
            value: req.body.relay2
        });
    }
    
    res.json({status: "success", message: "Command queued"});
});

// ✅ صفحه اصلی تست
app.get('/', (req, res) => {
    res.send(`
        <html dir="rtl">
        <body style="font-family: Tahoma;">
            <h1>🚚 کنترل یخچال کامیون - API</h1>
            <p>سرور فعال است! ✅</p>
            <p>آدرس‌های موجود:</p>
            <ul>
                <li>POST /data - دریافت داده از ESP8266</li>
                <li>GET /status - دریافت وضعیت</li>
                <li>GET /commands - دریافت دستورات</li>
                <li>POST /control - ارسال دستور کنترل</li>
            </ul>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
