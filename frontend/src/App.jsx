import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import FloatingWidgets from "./components/common/FloatingWidgets";
import HomePage from "./pages/HomePage";
import CatalogoObrasPage from "./pages/CatalogoObrasPage";
import ObraDetallePage from "./pages/ObraDetallePage";
import ExposicionesPage from "./pages/ExposicionesPage";
import ExposicionDetallePage from "./pages/ExposicionDetallePage";
import CursosPage from "./pages/CursosPage";
import CursoDetallePage from "./pages/CursoDetallePage";
import { ArtistasPage, ArtistaDetallePage } from "./pages/ArtistasPages";
import { FavoritosPage, CarritoPage } from "./pages/FavoritosCarritoPages";
import { CheckoutPage, FacturaPage } from "./pages/CheckoutFacturaPages";
import {
  NosotrosPage,
  ContactoPage,
  EquipoPage,
} from "./pages/NosotrosContactoEquipoPages";
import {
  PqrPage,
  PoliticaDatosPage,
  PreguntasFrecuentesPage,
  BuscarPage,
  NotFoundPage,
} from "./pages/PqrLegalFaqSearch404Pages";
import {
  AdminLoginPage,
  AdminDashboardPage,
  AdminInventarioPage,
  AdminFacturasPage,
  AdminPqrPage,
  AdminCrudEntityPage,
} from "./pages/AdminPages";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollToTop />
      <Header />
      <main id="contenido-principal" className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/obras" element={<CatalogoObrasPage />} />
          <Route path="/obras/detalle/:slug" element={<ObraDetallePage />} />
          <Route path="/obras/:tecnica" element={<CatalogoObrasPage />} />
          <Route path="/exposiciones" element={<ExposicionesPage />} />
          <Route path="/exposiciones/:id" element={<ExposicionDetallePage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/cursos/:id" element={<CursoDetallePage />} />
          <Route path="/cursos/:id/inscripcion" element={<CursoDetallePage />} />
          <Route path="/artistas" element={<ArtistasPage />} />
          <Route path="/artistas/:slug" element={<ArtistaDetallePage />} />
          <Route path="/nosotros" element={<NosotrosPage />} />
          <Route path="/contacto" element={<ContactoPage />} />
          <Route path="/pqr" element={<PqrPage />} />
          <Route path="/buscar" element={<BuscarPage />} />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedido/:id/factura" element={<FacturaPage />} />
          <Route path="/equipo" element={<EquipoPage />} />
          <Route path="/politica-de-datos" element={<PoliticaDatosPage />} />
          <Route path="/preguntas-frecuentes" element={<PreguntasFrecuentesPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/inventario" element={<AdminInventarioPage />} />
          <Route path="/admin/facturas" element={<AdminFacturasPage />} />
          <Route path="/admin/pqr" element={<AdminPqrPage />} />
          <Route path="/admin/:entidad" element={<AdminCrudEntityPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <FloatingWidgets />
      <Footer />
    </div>
  );
};

export default App;
