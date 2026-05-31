import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Calendario from "./pages/Calendario"
import Ranking from "./pages/Ranking"
import Academias from "./pages/Academias"
import Atletas from "./pages/Atletas"
import Fotos from "./pages/Fotos"

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
      </Routes>
    </BrowserRouter>
  )
}
