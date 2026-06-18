import { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD2cdAT4Rhp9bJrQziBBWGCXgI-ZYZtilQ",
  authDomain: "crashguard-e857f.firebaseapp.com",
  databaseURL: "https://crashguard-e857f-default-rtdb.firebaseio.com",
  projectId: "crashguard-e857f",
  storageBucket: "crashguard-e857f.firebasestorage.app",
  messagingSenderId: "547225274421",
  appId: "1:547225274421:web:bbbf511ea1e53e1093c97c",
  measurementId: "G-W1W5KW62FL"
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getDatabase(app);

function HospitalDashboard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const alertsRef = ref(db, "hospitalAlerts");

    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const list = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key]
          }))
          .reverse();

        setAlerts(list);
      } else {
        setAlerts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const getRouteLink = (alert) => {
    if (alert.hospitalRouteLink) {
      return alert.hospitalRouteLink;
    }

    if (alert.accidentLat && alert.accidentLng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${alert.accidentLat},${alert.accidentLng}&travelmode=driving`;
    }

    if (alert.mapLink && alert.mapLink.includes("q=")) {
      const accidentLocation = alert.mapLink.split("q=")[1];
      return `https://www.google.com/maps/dir/?api=1&destination=${accidentLocation}&travelmode=driving`;
    }

    return "https://www.google.com/maps/search/nearest+hospital";
  };

  return (
    <div style={{ marginTop: "50px" }}>
      <h2>🏥 Hospital Emergency Dashboard</h2>

      {alerts.length === 0 && <p>No emergency alerts yet</p>}

      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          style={{
            border: index === 0 ? "4px solid lime" : "2px solid orange",
            borderRadius: "12px",
            margin: "15px auto",
            padding: "20px",
            background: "#111827",
            color: "white",
            maxWidth: "750px"
          }}
        >
          {index === 0 && <h3>🚑 LATEST HOSPITAL ALERT</h3>}
          {index !== 0 && <h3>⚠️ Accident Alert</h3>}

          <p>
            <b>Victim:</b> {alert.victim}
          </p>

          <p>
            <b>Severity:</b> {alert.severity}
          </p>

          <p>
            <b>Accident Location:</b> {alert.location}
          </p>

          <p>
            <b>Nearest Hospital:</b> {alert.hospital || "Demo Hospital"}
          </p>

          <p>
            <b>Hospital Phone:</b> {alert.hospitalPhone || "Not available"}
          </p>

          <p>
            <b>Distance:</b> {alert.hospitalDistance || "Calculating..."}
          </p>

          <p>
            <b>Time:</b> {alert.createdAt}
          </p>

          <p>
            <b>Status:</b> {alert.status}
          </p>

          <p>
            <b>Accident Map:</b>{" "}
            <a
              href={alert.mapLink}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#38bdf8" }}
            >
              View Accident Location
            </a>
          </p>

          <p>
            <b>Clear Route:</b>{" "}
            <a
              href={getRouteLink(alert)}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "white",
                background: "green",
                padding: "8px 12px",
                borderRadius: "6px",
                textDecoration: "none"
              }}
            >
              Open Fastest Route in Google Maps
            </a>
          </p>
        </div>
      ))}
    </div>
  );
}

export default HospitalDashboard;