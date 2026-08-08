import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard";
import LanguageWorkspace from "./pages/LanguageWorkspace";
import Curriculum from "./pages/Curriculum";
import Lesson from "./pages/Lesson";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/languages/:languageId"
            element={<LanguageWorkspace />}
          />

          <Route
            path="/languages/:languageId/curriculum"
            element={<Curriculum />}
          />

          <Route
            path="/languages/:languageId/lesson/:lessonId"
            element={<Lesson />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;