"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type UnfairState = {
  count: number;
  reason: string;
  history: string[];
  reset_date: string | null;
};

export default function Home() {
  const [count, setCount] = useState(0);
  const [reason, setReason] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReason, setResetReason] = useState("");
  const [resetUsed, setResetUsed] = useState(false);

  const [loading, setLoading] = useState(true);

  const historyRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  const saveState = async (newState: UnfairState) => {
    const { error } = await supabase
      .from("unfair_state")
      .update({
        count: newState.count,
        reason: newState.reason,
        history: newState.history,
        reset_date: newState.reset_date,
      })
      .eq("id", 1);

    if (error) {
      console.error(error);
      showCustomAlert("Database save failed. Check Supabase setup.");
    }
  };

  const loadState = async () => {
    const { data, error } = await supabase
      .from("unfair_state")
      .select("count, reason, history, reset_date")
      .eq("id", 1)
      .single();

    if (error) {
      console.error(error);
      showCustomAlert("Could not load saved data from Supabase.");
      setLoading(false);
      return;
    }

    setCount(data.count ?? 0);
    setReason(data.reason ?? "");
    setHistory(Array.isArray(data.history) ? data.history : []);
    setResetUsed(data.reset_date === today);
    setLoading(false);
  };

  useEffect(() => {
    loadState();
  }, []);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = 0;
    }
  }, [history]);

  const showCustomAlert = (msg: string) => {
    setAlertMsg(msg);
    setShowAlert(true);
  };

  const addHug = async () => {
    const newCount = count + 1;
    const newReason = "You missed her ❤️";
    const newHistory = [`+1 — missed her`, ...history];

    setCount(newCount);
    setReason(newReason);
    setHistory(newHistory);

    await saveState({
      count: newCount,
      reason: newReason,
      history: newHistory,
      reset_date: resetUsed ? today : null,
    });
  };

  const openRemove = () => {
    if (count === 0) {
      showCustomAlert("Nice try 😌\nDebt can't go below 0.");
      return;
    }
    setShowModal(true);
  };

  const confirmRemove = async () => {
    if (!input.trim()) {
      showCustomAlert("Reason is required 👑");
      return;
    }

    const newCount = Math.max(0, count - 1);
    const newReason = input.trim();
    const newHistory = [`-1 — ${newReason}`, ...history];

    setCount(newCount);
    setReason(newReason);
    setHistory(newHistory);
    setInput("");
    setShowModal(false);

    await saveState({
      count: newCount,
      reason: newReason,
      history: newHistory,
      reset_date: resetUsed ? today : null,
    });
  };

  const openReset = () => {
    if (resetUsed) {
      showCustomAlert("Reset can be used only once per day 👑");
      return;
    }
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    if (!resetReason.trim()) {
      showCustomAlert("Reset reason is required 💣");
      return;
    }

    const newReason = resetReason.trim();
    const newHistory = [`💣 Reset — ${newReason}`, ...history];

    setCount(0);
    setReason(newReason);
    setHistory(newHistory);
    setResetUsed(true);
    setResetReason("");
    setShowResetModal(false);

    await saveState({
      count: 0,
      reason: newReason,
      history: newHistory,
      reset_date: today,
    });
  };

  const getWarning = () => {
    if (count >= 20) return "🚨 Emergency hug delivery required";
    if (count >= 10) return "⚠️ Danger zone";
    return "😌 Safe... for now";
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading unfair data...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1}></div>
      <div style={styles.bgCircle2}></div>

      <div style={styles.card}>
        <h1 style={styles.title}>Unfair Website</h1>
        <p style={styles.subtitle}>Because she is always right.</p>

        <div style={styles.counter}>{count} ❤️</div>

        <p style={styles.warning}>{getWarning()}</p>

        <div style={styles.buttonRow}>
          <button style={styles.addBtn} onClick={addHug}>
            +1 I missed her
          </button>

          <button style={styles.removeBtn} onClick={openRemove}>
            -1 She reduced
          </button>
        </div>

        <button
          style={{
            ...styles.resetBtn,
            opacity: resetUsed ? 0.5 : 1,
            cursor: resetUsed ? "not-allowed" : "pointer",
          }}
          onClick={openReset}
        >
          💣 Reset once today
        </button>

        <p style={styles.reason}>
          {reason ? `“${reason}”` : "No unfair reason yet 👀"}
        </p>
      </div>

      <div style={styles.historyBox}>
        <h2 style={styles.historyTitle}>History</h2>

        <div ref={historyRef} style={styles.historyScroll}>
          {history.length === 0 ? (
            <p style={styles.empty}>No actions yet</p>
          ) : (
            history.map((item, i) => (
              <div key={i} style={styles.historyItem}>
                {item}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Why reduce? 👀</h3>

            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter reason..."
            />

            <div style={styles.modalBtns}>
              <button style={styles.cancel} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button style={styles.confirm} onClick={confirmRemove}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3>Reset everything? 💣</h3>
            <p style={styles.modalText}>
              Reason is required because this is unfair.
            </p>

            <input
              style={styles.input}
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
              placeholder="Why reset today?"
            />

            <div style={styles.modalBtns}>
              <button
                style={styles.cancel}
                onClick={() => {
                  setResetReason("");
                  setShowResetModal(false);
                }}
              >
                Cancel
              </button>

              <button style={styles.resetConfirm} onClick={confirmReset}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p style={{ marginBottom: "15px", whiteSpace: "pre-line" }}>
              {alertMsg}
            </p>

            <button style={styles.confirm} onClick={() => setShowAlert(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "Arial",
    background: "linear-gradient(135deg, #ffe4e6, #fdf2f8, #f0f9ff)",
    position: "relative",
    overflow: "hidden",
  },

  bgCircle1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "#fbcfe8",
    borderRadius: "50%",
    top: "-100px",
    left: "-100px",
    filter: "blur(80px)",
    opacity: 0.6,
  },

  bgCircle2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "#c7d2fe",
    borderRadius: "50%",
    bottom: "-100px",
    right: "-100px",
    filter: "blur(80px)",
    opacity: 0.6,
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    width: "320px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    zIndex: 1,
  },

  title: {
    fontSize: "24px",
    fontWeight: "bold",
  },

  subtitle: {
    color: "#777",
    marginBottom: "20px",
  },

  counter: {
    fontSize: "50px",
    margin: "20px 0",
  },

  warning: {
    fontSize: "14px",
    marginBottom: "10px",
    color: "#444",
  },

  buttonRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  addBtn: {
    background: "#f472b6",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "20px",
    cursor: "pointer",
  },

  removeBtn: {
    background: "#111827",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "20px",
    cursor: "pointer",
  },

  resetBtn: {
    marginTop: "12px",
    background: "linear-gradient(135deg, #ef4444, #be123c)",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "999px",
    fontWeight: "bold",
    boxShadow: "0 8px 18px rgba(239,68,68,0.25)",
  },

  reason: {
    marginTop: "15px",
    color: "#555",
    fontSize: "14px",
  },

  historyBox: {
    marginTop: "20px",
    width: "320px",
    background: "white",
    padding: "15px",
    borderRadius: "15px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    zIndex: 1,
  },

  historyTitle: {
    fontWeight: "bold",
    marginBottom: "10px",
  },

  historyScroll: {
    height: "160px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  historyItem: {
    background: "#f9fafb",
    padding: "10px",
    borderRadius: "10px",
    fontSize: "13px",
  },

  empty: {
    color: "#aaa",
    fontSize: "13px",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  modal: {
    background: "white",
    padding: "20px",
    borderRadius: "15px",
    width: "280px",
    textAlign: "center",
  },

  modalText: {
    color: "#777",
    fontSize: "13px",
    marginTop: "6px",
  },

  input: {
    width: "100%",
    padding: "8px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },

  modalBtns: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
  },

  cancel: {
    background: "#e5e7eb",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  confirm: {
    background: "#f472b6",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  resetConfirm: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};