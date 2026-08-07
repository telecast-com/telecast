import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

function showError(err) {
  const root = document.getElementById("root");
  root.innerHTML =
    '<pre style="color:#ff4444;background:#111;padding:20px;white-space:pre-wrap;font-size:12px;line-height:1.5;min-height:100vh;margin:0;">' +
    "XATOLIK TOPILDI:\n\n" +
    (err && err.stack ? err.stack : String(err)) +
    "</pre>";
}

window.addEventListener("error", (e) => showError(e.error || e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason));

try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (err) {
  showError(err);
}
