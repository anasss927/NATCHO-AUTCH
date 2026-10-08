require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
app.use(express.json());

// ======================
// 1. الاتصال بقاعدة البيانات
// ======================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch(err => console.log('❌ خطأ في قاعدة البيانات:', err));

// ======================
// 2. نموذج الكي (Key Schema)
// ======================
const KeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  scriptId: { type: String, required: true },
  hwid: { type: String, default: null },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Key = mongoose.model('Key', KeySchema);

// ======================
// 3. API البسيط
// ======================

// صفحة الرئيسية (باش تعرف أن السيرفر خدام)
app.get('/', (req, res) => {
  res.send('✅ Polsec Starter API خدام مزيان');
});

// لودر السكريبت (مثال بسيط)
app.get('/loader/:scriptId', async (req, res) => {
  const scriptKey = req.query.key; // اليوزر كيبعت الكي فـ الرابط
  const scriptId = req.params.scriptId;

  if (!scriptKey) {
    return res.status(400).send('-- محتاج كي');
  }

  try {
    const foundKey = await Key.findOne({ key: scriptKey, scriptId: scriptId });

    if (!foundKey) {
      return res.status(403).send('-- كي غلط');
    }

    // هنا غادي يرجع السكريبت ديالك (دابا مثال)
    res.send(`
print("✅ تم التحقق من الكي بنجاح")
print("السكريبت ديالك غادي يبدا هنا")
-- حط السكريبت الحقيقي ديالك هنا
    `);
  } catch (err) {
    res.status(500).send('-- خطأ في السيرفر');
  }
});

// ======================
// 4. بوت Discord
// ======================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', () => {
  console.log(`✅ البوت خدام: ${client.user.tag}`);
});

// أمر بسيط باش تولد كي (مؤقت - غادي نحسنوه من بعد)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!generatekey') {
    const newKey = 'KEY-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    await Key.create({
      key: newKey,
      scriptId: 'main'
    });

    message.reply(`✅ تم توليد كي جديد:\n\`${newKey}\``);
  }
});

// ======================
// 5. تشغيل السيرفر
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API خدام على البورت ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
