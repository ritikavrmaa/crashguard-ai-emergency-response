require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const db = require("./firebase");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 CrashGuard backend is running");
});


// ✅ HOSPITAL DATABASE (edit as needed)
const hospitals = [
  { name: "Columbia Asia Hospital Whitefield", lat: 13.0116, lng: 77.7081, phone: "08061656666" },
  { name: "Aster Whitefield Hospital", lat: 12.9961, lng: 77.6960, phone: "08077778888" },
  { name: "Manipal Hospital Whitefield", lat: 12.9698, lng: 77.7499, phone: "08022221111" },
  { name: "Apollo Hospital Whitefield", lat: 12.9592, lng: 77.7300, phone: "08033334444" }
];


// ✅ DISTANCE CALCULATION
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


// ✅ FIND NEAREST HOSPITAL
function findNearestHospital(lat, lng) {
  let nearest = hospitals[0];
  let minDistance = getDistance(lat, lng, nearest.lat, nearest.lng);

  hospitals.forEach((h) => {
    const dist = getDistance(lat, lng, h.lat, h.lng);

    if (dist < minDistance) {
      minDistance = dist;
      nearest = h;
    }
  });

  console.log("📍 Accident:", lat, lng);
  console.log("🏥 Nearest Hospital:", nearest.name);
  console.log("📏 Distance:", minDistance.toFixed(2), "km");

  return {
    ...nearest,
    distance: minDistance.toFixed(2) + " km"
  };
}


// 🚨 CREATE ALERT API
app.post("/create-alert", async (req, res) => {
  try {
    const lat = req.body.lat || 12.9716;
    const lng = req.body.lng || 77.5946;

    const hospital = findNearestHospital(lat, lng);

    // 📍 MAP LINKS
    const accidentMap = `https://www.google.com/maps?q=${lat},${lng}`;
    const hospitalMap = `https://www.google.com/maps?q=${hospital.lat},${hospital.lng}`;

    // 🧭 ROUTE (Hospital → Accident)
    const route = `https://www.google.com/maps/dir/?api=1&origin=${hospital.lat},${hospital.lng}&destination=${lat},${lng}&travelmode=driving`;

    // 🔍 Nearby hospitals search
    const nearbyHospitalsLink = `https://www.google.com/maps/search/hospitals/@${lat},${lng},15z`;

    const alertData = {
      victim: "Demo Driver",
      severity: "Critical",
      location: `Lat: ${lat}, Lng: ${lng}`,

      mapLink: accidentMap,

      hospital: hospital.name,
      hospitalPhone: hospital.phone,
      hospitalDistance: hospital.distance,

      hospitalMapLink: hospitalMap,
      hospitalRouteLink: route,
      nearbyHospitalsLink,

      status: "New Alert",
      createdAt: new Date().toLocaleString()
    };

    // 💾 SAVE TO FIREBASE
    await db.ref("alerts").push(alertData);
    await db.ref("hospitalAlerts").push(alertData);

    // 📩 MESSAGE CONTENT
    const message = `🚨 CrashGuard Emergency Alert!

📍 Accident Location:
${accidentMap}

🏥 Nearest Hospital:
${hospital.name}

📏 Distance:
${hospital.distance}

📍 Hospital Location:
${hospitalMap}

🧭 Fastest Route:
${route}

🔍 Nearby Hospitals:
${nearbyHospitalsLink}`;

    // 📲 SMS
    try {
      await axios.post(
        "https://www.fast2sms.com/dev/bulkV2",
        {
          route: "q",
          message,
          numbers: process.env.EMERGENCY_PHONE
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY
          }
        }
      );
      console.log("✅ SMS Sent");
    } catch (err) {
      console.log("❌ SMS ERROR:", err.response?.data || err.message);
    }

    // 📩 TELEGRAM (WITH DEBUG)
    try {
      console.log("📩 Sending Telegram...");

      const tg = await axios.post(
        `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
        {
          chat_id: process.env.CHAT_ID,
          text: message
        }
      );

      console.log("✅ Telegram Sent:", tg.data);
    } catch (err) {
      console.log("❌ Telegram ERROR:", err.response?.data || err.message);
    }

    // ✅ RESPONSE TO FRONTEND
    res.json({
      success: true,
      hospital: hospital.name,
      distance: hospital.distance,
      route,
      nearbyHospitalsLink
    });

  } catch (err) {
    console.log("❌ SERVER ERROR:", err.message);
    res.status(500).json({ error: "Failed to create alert" });
  }
});


// 🚀 START SERVER
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});