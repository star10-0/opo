import { useEffect, useState } from "react";
import { approvalsApi } from "../api";
import { canAny } from "../lib/permissions";
import { EmptyState, ErrorState, LoadingState, SuccessState } from "../components/Feedback";
import { useLanguage } from "../i18n/LanguageContext";

function ApprovalsPage({ stationId }) {
  const { t } = useLanguage();
  const role = localStorage.getItem("role") || "worker";
  const [state, setState] = useState({ loading: true, error: "", success: "", rows: [] });
  const [requestType, setRequestType] = useState("edit");
  const [reason, setReason] = useState("");

  const load = async () => {
    if (!stationId) return;
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const rows = await approvalsApi.list({ stationId });
      setState({ loading: false, error: "", success: "", rows: rows?.items || rows || [] });
    } catch (e) {
      setState({ loading: false, error: e.message, success: "", rows: [] });
    }
  };

  useEffect(() => { load(); }, [stationId]);

  const createRequest = async () => {
    try {
      await approvalsApi.create({
        stationId,
        entityType: "WorkerClosing",
        entityId: "000000000000000000000000",
        requestType,
        requestedBy: localStorage.getItem("userId") || "000000000000000000000000",
        reason: reason || "طلب موافقة من الواجهة"
      });
      setReason("");
      setState((s) => ({ ...s, success: "تم إنشاء طلب الموافقة" }));
      load();
    } catch (e) {
      setState((s) => ({ ...s, error: e.message }));
    }
  };

  const decide = async (id, decision) => {
    const by = localStorage.getItem("userId") || "000000000000000000000000";
    try {
      if (role === "accountant") await approvalsApi.accountantDecision(id, { decision, by });
      if (role === "admin") await approvalsApi.managerDecision(id, { decision, by });
      setState((s) => ({ ...s, success: "تم تحديث القرار" }));
      load();
    } catch (e) {
      setState((s) => ({ ...s, error: e.message }));
    }
  };

  if (state.loading) return <LoadingState />;
  return (
    <div>
      <h3>{t("approvals")}</h3>
      {canAny(["approve_post_archive_edits_where_allowed", "co_approve_sensitive_edits", "co_approve_deletes"]) ? (
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select value={requestType} onChange={(e) => setRequestType(e.target.value)}>
            <option value="edit">edit</option>
            <option value="delete">delete</option>
            <option value="reopen">reopen</option>
            <option value="unlock_opening_reading">unlock_opening_reading</option>
          </select>
          <input value={reason} placeholder={t("reason")} onChange={(e) => setReason(e.target.value)} />
          <button onClick={createRequest}>{t("createApproval")}</button>
        </div>
      ) : null}
      {state.error ? <ErrorState error={state.error} /> : null}
      <SuccessState message={state.success} />
      {state.rows.length === 0 ? <EmptyState text={t("approvalsEmpty")} /> : (
        <table style={{ width: "100%" }}><thead><tr><th>{t("type")}</th><th>{t("status")}</th><th>{t("reason")}</th><th>{t("actions")}</th></tr></thead><tbody>
          {state.rows.map((row) => (
            <tr key={row._id}>
              <td>{row.requestType}</td>
              <td>{row.finalStatus}</td>
              <td>{row.reason}</td>
              <td>
                {role === "accountant" && row.accountantDecision?.decision === "pending" ? (
                  <>
                    <button onClick={() => decide(row._id, "approved")}>{t("approve")}</button>
                    <button onClick={() => decide(row._id, "rejected")}>{t("reject")}</button>
                  </>
                ) : null}
                {role === "admin" && row.managerDecision?.decision === "pending" ? (
                  <>
                    <button onClick={() => decide(row._id, "approved")}>{t("approve")}</button>
                    <button onClick={() => decide(row._id, "rejected")}>{t("reject")}</button>
                  </>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody></table>
      )}
    </div>
  );
}

export default ApprovalsPage;
