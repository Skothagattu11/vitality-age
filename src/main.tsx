import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// React replaces static HTML instantly on mount
createRoot(document.getElementById("root")!).render(<App />);
