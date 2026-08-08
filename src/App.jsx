import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import Dashboard from "./pages/Dashboard";
import Languages from "./pages/Languages";
import LanguageWorkspace from "./pages/LanguageWorkspace";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/languages"
            element={<Languages />}
          />

          <Route
            path="/languages/:languageId"
            element={<LanguageWorkspace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;