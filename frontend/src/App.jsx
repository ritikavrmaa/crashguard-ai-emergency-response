import Dashboard from "./Dashboard";
import HospitalDashboard from "./HospitalDashboard";
import { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [view, setView] = useState("main");
  const [status, setStatus] = useState("Not Driving");
  const [countdown, setCountdown] = useState(null);
  const timerRef = useRef(null);

  const emergencyPhone = "7004964397";

  const speak = (text) => {
    const voice = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(voice);
  };

  const startDriving = () => {
    setStatus("Monitoring for accidents...");
  };

  const simulateAccident = () => {
    setStatus("Possible accident detected. Waiting for response...");
    setCountdown(15);

    speak(
      "Possible accident detected. Are you safe? Tap I am safe within 15 seconds."
    );

    let timeLeft = 15;

    timerRef.current = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);

      if (timeLeft === 0) {
        clearInterval(timerRef.current);
        setCountdown(null);
        sendSOS();
      }
    }, 1000);
  };

  const markSafe = () => {
    clearInterval(timerRef.current);
    setCountdown(null);
    setStatus("Safe. Alert cancelled.");
    speak("Alert cancelled. User is safe.");
  };

  const sendSOS = () => {
    setStatus("Getting live GPS location...");

    if (!navigator.geolocation) {
      sendAlertToBackend(null, null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        sendAlertToBackend(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        setStatus("Location denied/unavailable. Sending SOS...");
        sendAlertToBackend(null, null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const sendAlertToBackend = async (latitude, longitude) => {
    const hasLocation =
      latitude !== null &&
      longitude !== null &&
      latitude !== undefined &&
      longitude !== undefined;

    const locationText = hasLocation
      ? `Lat: ${latitude}, Lng: ${longitude}`
      : "Location not available";

    const alertData = {
      victim: "Demo Driver",
      severity: "Critical",
      location: locationText,
      lat: hasLocation ? latitude : 12.9716,
      lng: hasLocation ? longitude : 77.5946,
      emergencyContact: emergencyPhone
    };

    try {
      setStatus("🚀 Sending SOS...");

      const response = await axios.post(
        "http://localhost:5000/create-alert",
        alertData
      );

      setStatus(
        `🚨 SOS Sent! Nearest Hospital: ${response.data.hospital}`
      );

      speak("SOS alert sent successfully.");
    } catch (error) {
      console.log("ERROR:", error.response?.data || error.message);

      setStatus(
        "❌ Failed to send SOS (Check backend / internet / server)"
      );

      speak("Failed to send SOS. Please check connection.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "30px" }}>
      <h1>🚗 CrashGuard</h1>
      <h2>AI Emergency Response System</h2>

      {/* 🔘 Dashboard Selector */}
      <div style={{ marginBottom: "25px" }}>
        <button onClick={() => setView("main")}>🚗 Driver App</button>

        <button
          onClick={() => setView("admin")}
          style={{ marginLeft: "10px" }}
        >
          🛡️ Admin Dashboard
        </button>

        <button
          onClick={() => setView("hospital")}
          style={{ marginLeft: "10px" }}
        >
          🏥 Hospital Dashboard
        </button>
      </div>

      {/* 🚗 DRIVER VIEW */}
      {view === "main" && (
        <div>
          <p>Status: {status}</p>

          <button onClick={startDriving}>Start Driving Mode</button>

          <br />
          <br />

          <button
            onClick={simulateAccident}
            style={{
              background: "red",
              color: "white",
              padding: "10px"
            }}
          >
            Simulate Accident
          </button>

          {countdown !== null && (
            <div>
              <h2>⏱️ Are you safe?</h2>
              <h1>{countdown}</h1>

              <button
                onClick={markSafe}
                style={{
                  background: "green",
                  color: "white",
                  padding: "10px"
                }}
              >
                I AM SAFE
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🛡️ ADMIN DASHBOARD */}
      {view === "admin" && <Dashboard />}

      {/* 🏥 HOSPITAL DASHBOARD */}
      {view === "hospital" && <HospitalDashboard />}
    </div>
  );
}

export default App;