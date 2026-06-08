import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// NOTE: StrictMode intentionally omitted. Its dev-only double-invoke of effects
// creates and disposes every WebGL context twice, which trips Chrome's
// "too many active WebGL contexts" limit across our shader/3D canvases.
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
