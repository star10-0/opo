import { useEffect, useState } from "react";
import API from "../services/api";
import PrintButton from "../components/PrintButton";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await API.get("/payments");
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>المدفوعات</h2>
      <PrintButton />

      {loading ? (
        <p>جارٍ التحميل...</p>
      ) : payments.length === 0 ? (
        <p>لا توجد مدفوعات حتى الآن</p>
      ) : (
        payments.map((p) => (
          <div key={p._id} style={card}>
            <div>المبلغ: {p.amount}</div>
            <div>الطريقة: {p.method}</div>
            <div>الحالة: {p.status}</div>
            <div>التاريخ: {p.date}</div>
            <div>ملاحظة: {p.note}</div>
          </div>
        ))
      )}
    </div>
  );
}

const card = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 16,
  marginBottom: 12,
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
};

export default Payments;
