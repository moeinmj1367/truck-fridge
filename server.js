const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
    output1: false,
    output2: false,
    output3: false
};

let pendingCommands = [];

// ✅ صفحه اصلی وب
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>کنترل یخچال کامیون</title>
        <style>
            body { 
                font-family: Tahoma, Arial, sans-serif; 
                text-align: center; 
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                color: white;
            }
            .container { 
                max-width: 500px; 
                margin: 0 auto;
                background: rgba(255,255,255,0.1);
                padding: 30px;
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            .status { 
                background: rgba(255,255,255,0.2); 
                padding: 20px; 
                margin: 20px 0; 
                border-radius: 10px; 
            }
            .control-panel { 
                background: rgba(255,255,255,0.15); 
                padding: 20px; 
                margin: 20px 0; 
                border-radius: 10px; 
            }
            button { 
                padding: 12px 25px; 
                margin: 8px; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer; 
                font-size: 16px;
                transition: all 0.3s;
            }
            button:hover { transform: scale(1.05); }
            .on { background: #4CAF50; color: white; }
            .off { background: #f44336; color: white; }
            .temp { 
                font-size: 28px; 
                color: #FFD700; 
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .status-item { margin: 10px 0; font-size: 18px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚚 کنترل یخچال کامیون</h1>
            
            <div class="status">
                <div class="status-item">
                    <h3>🌡️ دمای فعلی</h3>
                    <div class="temp" id="temperature">${deviceData.temperature}</div>
                </div>
            </div>

            <div class="control-panel">
                <h3>⚡ خروجی ۱ (کمپرسور)</h3>
                <button class="on" onclick="controlOutput(1, 1)">🔄 روشن</button>
                <button class="off" onclick="controlOutput(1, 0)">⭕ خاموش</button>
                <div class="status-item" id="status1">${deviceData.output1 ? '🟢 روشن' : '🔴 خاموش'}</div>
            </div>

            <div class="control-panel">
                <h3>⚡ خروجی ۲ (فن‌ها)</h3>
                <button class="on" onclick="controlOutput(2, 1)">🔄 روشن</button>
                <button class="off" onclick="controlOutput(2, 0)">⭕ خاموش</button>
                <div class="status-item" id="status2">${deviceData.output2 ? '🟢 روشن' : '🔴 خاموش'}</div>
            </div>

            <div class="control-panel">
                <h3>💡 خروجی ۳ (LED)</h3>
                <button class="on" onclick="controlOutput(3, 1)">🔄 روشن</button>
                <button class="off" onclick="controlOutput(3, 0)">⭕ خاموش</button>
                <div class="status-item" id="status3">${deviceData.output3 ? '🟢 روشن' : '🔴 خاموش'}</div>
            </div>

            <button onclick="updateStatus()" style="background: #2196F3; color: white; padding: 12px 30px; margin-top: 20px;">
                🔄 بروزرسانی وضعیت
            </button>
        </div>

        <script>
            const API_URL = "https://truck-fridge-api.onrender.com";

            async function controlOutput(outputNum, state) {
                try {
                    const response = await fetch(API_URL + '/control', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            output: outputNum.toString(),
                            state: state
                        })
                    });
                    
                    if (response.ok) {
                        alert('✅ دستور ارسال شد');
                        updateStatus();
                    } else {
                        alert('❌ خطا در ارسال دستور');
                    }
                } catch (error) {
                    alert('❌ خطا در ارتباط با سرور');
                }
            }

            async function updateStatus() {
                try {
                    const response = await fetch(API_URL + '/status');
                    const data = await response.json();
                    
                    document.getElementById('temperature').textContent = data.temperature.toFixed(1);
                    document.getElementById('status1').textContent = data.output1 ? ' 🟢 روشن' : ' 🔴 خاموش';
                    document.getElementById('status2').textContent = data.output2 ? ' 🟢 روشن' : ' 🔴 خاموش';
                    document.getElementById('status3').textContent = data.output3 ? ' 🟢 روشن' : ' 🔴 خاموش';
                } catch (error) {
                    alert('❌ خطا در دریافت وضعیت');
                }
            }

            // بروزرسانی خودکار هر 5 ثانیه
            setInterval(updateStatus, 5000);
        </script>
    </body>
    </html>
    `);
});

// API Routes
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
    
    const output = req.body.output;
    const state = req.body.state;
    
    if(output && state !== undefined) {
        pendingCommands.push({
            output: output,
            state: state
        });
        
        res.json({status: "success", message: `Output ${output} ${state ? 'ON' : 'OFF'}`});
    } else {
        res.status(400).json({error: "Invalid parameters"});
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Web Interface: https://truck-fridge-api.onrender.com`);
});
