import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Calendario from "./pages/Calendario"
import Ranking from "./pages/Ranking"
import Academias from "./pages/Academias"
import Atletas from "./pages/Atletas"
import Fotos from "./pages/Fotos"
import Login from "./pages/auth/Login"
import Cadastro from "./pages/auth/Cadastro"
import Verificar from "./pages/verificar/Verificar"
import Painel from "./pages/painel/Painel"
import Admin from "./pages/admin/Admin"
import ProtectedRoute from "./components/auth/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/academias" element={<Academias />} />
        <Route path="/atletas" element={<Atletas />} />
        <Route path="/fotos" element={<Fotos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/verificar/:cardId" element={<Verificar />} />
        <Route
          path="/painel"
          element={
            <ProtectedRoute>
              <Painel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
