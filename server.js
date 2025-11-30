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

// ✅ آدرس‌های API
app.post('/data', (req, res) => {
    console.log('📨 Data received:', req.body);
    deviceData = {...deviceData, ...req.body};
    res.json({status: "success", message: "Data received"});
});

app.get('/status', (req, res) => {
    console.log('📊 Status requested');
    res.json(deviceData);
});

// ✅ اضافه کردن آدرس commands که گم شده بود
app.get('/commands', (req, res) => {
    console.log('📥 Commands requested - Pending:', pendingCommands);
    const commands = [...pendingCommands];
    pendingCommands = []; // پاک کردن پس از ارسال
    res.json({commands: commands});
});

app.post('/control', (req, res) => {
    console.log('🎛️ Control command:', req.body);
    
    if(req.body.relay1 !== undefined) {
        pendingCommands.push({
            command: "relay1", 
            value: req.body.relay1 ? 1 : 0
        });
    }
    if(req.body.relay2 !== undefined) {
        pendingCommands.push({
            command: "relay2",
            value: req.body.relay2 ? 1 : 0
        });
    }
    
    res.json({status: "success", message: "Command queued"});
});

// ✅ صفحه اصلی تست
app.get('/', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>کنترل یخچال کامیون</title>
            <style>
                body { font-family: Tahoma; text-align: center; padding: 50px; }
                .box { background: #f0f0f0; padding: 20px; margin: 20px; border-radius: 10px; }
            </style>
        </head>
        <body>
            <h1>🚚 کنترل یخچال کامیون - API</h1>
            <p>سرور فعال است! ✅</p>
            
            <div class="box">
                <h3>وضعیت فعلی:</h3>
                <p>دما: ${deviceData.temperature}°C</p>
                <p>رله 1: ${deviceData.relay1 ? 'روشن' : 'خاموش'}</p>
                <p>رله 2: ${deviceData.relay2 ? 'روشن' : 'خاموش'}</p>
            </div>
            
            <div class="box">
                <h3>آدرس‌های موجود:</h3>
                <ul style="text-align: left; display: inline-block;">
                    <li><b>POST /data</b> - دریافت داده از ESP8266</li>
                    <li><b>GET /status</b> - دریافت وضعیت</li>
                    <li><b>GET /commands</b> - دریافت دستورات</li>
                    <li><b>POST /control</b> - ارسال دستور کنترل</li>
                </ul>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 API Endpoints:`);
    console.log(`   POST /data`);
    console.log(`   GET /status`);
    console.log(`   GET /commands`);
    console.log(`   POST /control`);
});
