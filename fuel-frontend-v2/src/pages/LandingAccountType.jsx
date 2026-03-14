import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

const cards = [
  { key: "individual", title: "محطة فردية", desc: "دخول مباشر لإدارة محطة واحدة بسرعة وكفاءة." },
  { key: "company", title: "مؤسسة متعددة المحطات", desc: "إدارة مركزية لمجموعة محطات ضمن مؤسسة واحدة." },
];

function LandingAccountType() {
  const navigate = useNavigate();
  const { isAuthenticated, setAccountType, accountType } = useAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="auth-shell" dir="rtl">
      <section className="auth-card auth-card-wide">
        <h1 className="auth-title">مرحبًا بك في Fuel Station System</h1>
        <p className="auth-subtitle">اختر نوع الدخول للمتابعة إلى تجربة SaaS احترافية ومخصصة.</p>

        <div className="account-grid">
          {cards.map((card) => (
            <button
              key={card.key}
              className={`account-card ${accountType === card.key ? "active" : ""}`}
              onClick={() => {
                setAccountType(card.key);
                navigate("/login");
              }}
            >
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default LandingAccountType;
