import { useEffect, useState } from "react";
import API from "../services/api";
import PrintButton from "../components/PrintButton";

function Tanks() {
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await API.get("/tanks");
      setTanks(res.data);
    } catch (err) {
      console.error(err);
      setTanks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>الصهاريج</h2>
      <PrintButton />

      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : tanks.length === 0 ? (
        <p>لا توجد بيانات حتى الآن</p>
      ) : (
        <table style={table}>
          <thead>
            <tr style={{ background: "#eef2f7" }}>
              <th>السائق</th>
              <th>رقم الصهريج</th>
              <th>التاريخ</th>
              <th>المادة</th>
              <th>اللترات</th>
              <th>المتبقي</th>
            </tr>
          </thead>
          <tbody>
            {tanks.map((t) => (
              <tr key={t._id}>
                <td>{t.driver}</td>
                <td>{t.tankNumber}</td>
                <td>{t.date}</td>
                <td>{t.fuelType}</td>
                <td>{t.liters}</td>
                <td>{t.currentLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
};

export default Tanks;
