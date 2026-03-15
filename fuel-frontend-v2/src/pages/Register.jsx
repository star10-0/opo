import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

const ACCOUNT_TYPES = [
  { value: "individual", label: "محطة فردية" },
  { value: "company", label: "مؤسسة متعددة المحطات" },
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  accountType: "individual",
  stationName: "",
  organizationName: "",
  role: "admin",
  rememberMe: true,
  agree: false,
};

function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  const titleByType = useMemo(() => (
    form.accountType === "individual" ? "إنشاء حساب محطة فردية" : "إنشاء حساب مؤسسة"
  ), [form.accountType]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "الاسم مطلوب";
    else if (form.name.trim().length < 3) nextErrors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";

    if (!form.email.trim()) nextErrors.email = "البريد الإلكتروني مطلوب";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) nextErrors.email = "يرجى إدخال بريد إلكتروني صحيح";

    if (!form.password) nextErrors.password = "كلمة المرور مطلوبة";
    else if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      nextErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي حرفًا كبيرًا ورقمًا";
    }

    if (!form.confirmPassword) nextErrors.confirmPassword = "تأكيد كلمة المرور مطلوب";
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = "تأكيد كلمة المرور غير مطابق";

    if (form.accountType === "individual" && !form.stationName.trim()) {
      nextErrors.stationName = "اسم المحطة مطلوب للحساب الفردي";
    }

    if (form.accountType === "company" && !form.organizationName.trim()) {
      nextErrors.organizationName = "اسم المؤسسة مطلوب لحساب المؤسسة";
    }

    if (!form.agree) {
      nextErrors.agree = "يجب الموافقة على الشروط قبل إنشاء الحساب";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setGeneralError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        stationName: form.stationName.trim(),
        organizationName: form.organizationName.trim(),
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setErrors(error?.fieldErrors || {});
      setGeneralError(error?.message || "تعذر إنشاء الحساب حاليًا");
    } finally {
      setLoading(false);
    }
  };

  const onFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  return (
    <main className="auth-shell" dir="rtl">
      <section className="auth-card auth-card-register">
        <h1 className="auth-title">{titleByType}</h1>
        <p className="auth-subtitle">املأ البيانات بشكل صحيح وسيتم إنشاء الحساب وتسجيل الدخول مباشرة.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="name">الاسم</label>
          <input id="name" type="text" value={form.name} onChange={(e) => onFieldChange("name", e.target.value)} />
          {errors.name ? <small className="field-error">{errors.name}</small> : null}

          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" type="email" value={form.email} onChange={(e) => onFieldChange("email", e.target.value)} />
          {errors.email ? <small className="field-error">{errors.email}</small> : null}

          <label htmlFor="password">كلمة المرور</label>
          <input id="password" type="password" value={form.password} onChange={(e) => onFieldChange("password", e.target.value)} />
          {errors.password ? <small className="field-error">{errors.password}</small> : null}

          <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
          <input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => onFieldChange("confirmPassword", e.target.value)} />
          {errors.confirmPassword ? <small className="field-error">{errors.confirmPassword}</small> : null}

          <label htmlFor="accountType">نوع الحساب</label>
          <select id="accountType" value={form.accountType} onChange={(e) => onFieldChange("accountType", e.target.value)}>
            {ACCOUNT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          {errors.accountType ? <small className="field-error">{errors.accountType}</small> : null}

          {form.accountType === "individual" ? (
            <>
              <label htmlFor="stationName">اسم المحطة</label>
              <input id="stationName" type="text" value={form.stationName} onChange={(e) => onFieldChange("stationName", e.target.value)} />
              {errors.stationName ? <small className="field-error">{errors.stationName}</small> : null}
            </>
          ) : (
            <>
              <label htmlFor="organizationName">اسم المؤسسة</label>
              <input id="organizationName" type="text" value={form.organizationName} onChange={(e) => onFieldChange("organizationName", e.target.value)} />
              {errors.organizationName ? <small className="field-error">{errors.organizationName}</small> : null}
            </>
          )}

          <label className="remember-row">
            <input type="checkbox" checked={form.rememberMe} onChange={(e) => onFieldChange("rememberMe", e.target.checked)} />
            <span>تذكرني على هذا الجهاز</span>
          </label>

          <label className="remember-row">
            <input type="checkbox" checked={form.agree} onChange={(e) => onFieldChange("agree", e.target.checked)} />
            <span>أوافق على الشروط وسياسة الاستخدام</span>
          </label>
          {errors.agree ? <small className="field-error">{errors.agree}</small> : null}

          {generalError ? <div className="auth-error">{generalError}</div> : null}

          <button type="submit" className="auth-btn" disabled={loading}>{loading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}</button>
        </form>

        <div className="auth-footer">
          <Link to="/login">لديك حساب بالفعل؟ تسجيل الدخول</Link>
        </div>
      </section>
    </main>
  );
}

export default Register;
