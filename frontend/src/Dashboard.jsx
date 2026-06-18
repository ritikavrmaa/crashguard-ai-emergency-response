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

// Prevent Firebase duplicate initialization error
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getDatabase(app);

function Dashboard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const alertsRef = ref(db, "alerts");

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

  return (
    <div style={{ marginTop: "50px" }}>
      <h2>🚨 Live Rescue Dashboard</h2>

      {alerts.length === 0 && <p>No alerts yet</p>}

      {alerts.map((alert) => (
        <div
          key={alert.id}
          style={{
            border: "2px solid red",
            borderRadius: "10px",
            margin: "15px auto",
            padding: "20px",
            background: "#1e293b",
            color: "white",
            maxWidth: "700px"
          }}
        >
          <h3>🚨 NEW ACCIDENT ALERT</h3>

          <p><b>Victim:</b> {alert.victim}</p>
          <p><b>Severity:</b> {alert.severity}</p>
          <p><b>Location:</b> {alert.location}</p>

          <p>
            <b>Live Map:</b>{" "}
            <a
              href={alert.mapLink}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#38bdf8" }}
            >
              Open Current Location
            </a>
          </p>

          <p><b>Hospital Info:</b> {alert.hospital}</p>

      <p>
  <b>Nearest Hospital Map:</b>{" "}
  <a
    href={
      alert.hospitalMapLink
        ? alert.hospitalMapLink
        : "https://www.google.com/maps/search/nearest+hospital"
    }
    target="_blank"
    rel="noreferrer"
    style={{ color: "#38bdf8" }}
  >
    Open Nearest Hospital Location
  </a>
</p>

          <p><b>Emergency Contact:</b> {alert.emergencyContact}</p>
          <p><b>Status:</b> {alert.status}</p>
          <p><b>Time:</b> {alert.createdAt}</p>

          <h3>🧠 AI First-Aid Guidance</h3>

          <ol style={{ textAlign: "left", display: "inline-block" }}>
            <li>Stay calm and check surroundings.</li>
            <li>Check if the victim is breathing.</li>
            <li>Do not move the person if neck or back injury is suspected.</li>
            <li>Apply pressure if there is bleeding.</li>
            <li>Call emergency services and wait for help.</li>
          </ol>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;