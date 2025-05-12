import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Importar Mock API (apenas será ativado em produção)
import "./lib/mockApi";

// Configuração para remixicon
import "remixicon/fonts/remixicon.css";

createRoot(document.getElementById("root")!).render(<App />);
