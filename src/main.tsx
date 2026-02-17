import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Hide loader now that React has rendered
const loader = document.getElementById("initial-loader");
if (loader) {
  loader.classList.add("hidden");
  setTimeout(() => loader.remove(), 300);
}
