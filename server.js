const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware ساده بدون cors
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    next();
});

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

app.get('/commands', (req, res) => {
    console.log('📥 Commands requested - Pending:', pendingCommands);
    const commands = [...pendingCommands];
    pendingCommands = [];
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

// صفحه اصلی
app.get('/', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>کنترل یخچال کامیون</title>
            <style>
                body { 
                    font-family: Tahoma; 
                    text-align: center; 
                    padding: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .box { 
                    background: rgba(255,255,255,0.1); 
                    padding: 20px; 
                    margin: 20px; 
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                }
            </style>
        </head>
        <body>
            <h1>🚚 کنترل یخچال کامیون - API</h1>
            <p>سرور فعال است! ✅</p>
            
            <div class="box">
                <h3>وضعیت فعلی:</h3>
                <p>دما: ${deviceData.temperature}°C</p>
                <p>رله 1: ${deviceData.relay1 ? '🟢 روشن' : '🔴 خاموش'}</p>
                <p>رله 2: ${deviceData.relay2 ? '🟢 روشن' : '🔴 خاموش'}</p>
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

            <div class="box">
                <h3>تست سریع:</h3>
                <button onclick="fetch('/status').then(r=>r.json()).then(console.log)">تست وضعیت</button>
                <button onclick="fetch('/commands').then(r=>r.json()).then(console.log)">تست دستورات</button>
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
