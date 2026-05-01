"use client";

import { useState, useRef, useEffect } from "react";

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

  const historyRef = useRef<HTMLDivElement>(null);

  /* 🌙 Auto +1 every 30s */
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + 1);
      setHistory((h) => ["🌙 +1 — Didn't hug today", ...h]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  /* Scroll to top */
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = 0;
    }
  }, [history]);

  const showCustomAlert = (msg: string) => {
    setAlertMsg(msg);
    setShowAlert(true);
  };

  const addHug = () => {
    setCount((c) => c + 1);
    setReason("You missed her ❤️");
    setHistory((h) => [`+1 — missed her`, ...h]);
  };

  const openRemove = () => {
    if (count === 0) {
      showCustomAlert("Nice try 😌\nDebt can't go below 0.");
      return;
    }
    setShowModal(true);
  };

  const confirmRemove = () => {
    if (!input.trim()) {
      showCustomAlert("Reason is required 👑");
      return;
    }

    setCount((c) => c - 1);
    setReason(input);
    setHistory((h) => [`-1 — ${input}`, ...h]);

    setInput("");
    setShowModal(false);
  };

  /* 💣 Reset logic */
  const openReset = () => {
    if (resetUsed) {
      showCustomAlert("Reset can be used only once per day 👑");
      return;
    }
    setShowResetModal(true);
  };

  const confirmReset = () => {
    if (!resetReason.trim()) {
      showCustomAlert("Reset reason is required 💣");
      return;
    }

    setCount(0);
    setReason(resetReason.trim());
    setHistory((h) => [`💣 Reset — ${resetReason.trim()}`, ...h]);

    setResetUsed(true);
    setResetReason("");
    setShowResetModal(false);
  };

  /* 🚨 Warning */
  const getWarning = () => {
    if (count >= 20) return "🚨 Emergency hug delivery required";
    if (count >= 10) return "⚠️ Danger zone";
    return "😌 Safe... for now";
  };

  return (
    <div style={styles.page}>
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

      {/* History */}
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

      {/* Remove Modal */}
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

      {/* Reset Modal */}
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

      {/* Alert Modal */}
      {showAlert && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p style={{ marginBottom: "15px", whiteSpace: "pre-line" }}>
              {alertMsg}
            </p>

            <button
              style={styles.confirm}
              onClick={() => setShowAlert(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles: any = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff1f2",
    padding: "20px",
    fontFamily: "Arial",
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    width: "320px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
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