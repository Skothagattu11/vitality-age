import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Remove static HTML now that React has rendered
const staticEl = document.getElementById("static-landing");
if (staticEl) staticEl.remove();
