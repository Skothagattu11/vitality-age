import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Gracefully transition from static HTML to React
const root = document.getElementById("root")!;
const initialLoader = document.getElementById("initial-loader");

// Create React root but keep static content visible
const reactRoot = createRoot(root);

// Render React app
reactRoot.render(<App />);

// The static HTML will be replaced by React - this is expected behavior
// React handles its own loading states via Suspense
