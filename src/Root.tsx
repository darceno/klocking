import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import About from "./pages/About";
import { useAppStore } from "./state/store";
import { useThemeClass } from "./hooks/useThemeClass";

export default function Root() {
  const { state } = useAppStore();
  useThemeClass(state.theme);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}