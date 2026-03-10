import { useEffect, useState } from "react";
import API from "../services/api";
import PrintButton from "../components/PrintButton";

function GPS() {
  const [gps, setGps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/gps")
      .then((res) => setGps(res.data))
      .catch((err) => {
        console.error(err);
        setGps([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>مراقبة GPS</h2>
      <PrintButton />

      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : gps.length === 0 ? (
        <div style={placeholder}>خدمة GPS غير مفعلة بعد</div>
      ) : (
        gps.map((g) => (
          <div key={g._id}>
            {g.tankNumber} - {g.latitude}, {g.longitude}
          </div>
        ))
      )}
    </div>
  );
}

const placeholder = {
  background: "#f3f4f6",
  borderRadius: 12,
  padding: 30,
  color: "#374151"
};

export default GPS;
