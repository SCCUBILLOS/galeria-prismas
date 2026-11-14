import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { EMPRESA } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import Breadcrumbs from "../components/common/Breadcrumbs";
import ObraCard from "../components/common/ObraCard";
import Loader from "../components/crud/Loader";

/**
 * Páginas de Artistas (/artistas y /artistas/:slug)
 * Muestra biografía, trayectoria y obras asociadas a cada artista.
 */
export const ArtistasPage = () => {
  const [artistas, setArtistas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/artistas`)
      .then((res) => {
        if (!res.err) setArtistas(res.datos || []);
        setCargando(false);
      });
  }, []);

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Artistas Representados" }]} />

      <h1 className="h2 mb-1">Artistas de Galería Prismas</h1>
      <p className="text-muted small mb-4">
        Conoce la trayectoria, formación y catálogo disponible de nuestros creadores representados.
      </p>

      {cargando ? (
        <Loader texto="Cargando portafolio de artistas..." />
      ) : (
        <div className="row g-4">
          {artistas.map((art) => (
            <div key={art.id} className="col-md-6 col-lg-4">
              <article className="card h-100 shadow-sm border-0">
                <img
                  src={art.fotoUrl}
                  alt={`Retrato de ${art.nombre}`}
                  className="card-img-top"
                  style={{ height: "250px", objectFit: "cover" }}
                  loading="lazy"
                />
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <span className="badge bg-dark mb-2">{art.estilo}</span>
                    <h2 className="h5 mb-1">{art.nombre}</h2>
                    <p className="small text-gold fw-semibold mb-2">
                      {art.ciudad}, {art.pais}
                    </p>
                    <p className="small text-muted mb-3">{art.biografia}</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span className="small fw-semibold">
                      {art.obras?.length || 0} obras en catálogo
                    </span>
                    <Link to={`/artistas/${art.slug}`} className="btn btn-gold btn-sm">
                      Ver biografía y obras
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ArtistaDetallePage = () => {
  const { slug } = useParams();
  const [artista, setArtista] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/artistas/${slug}`)
      .then((res) => {
        if (!res.err && res.artista) setArtista(res.artista);
        setCargando(false);
      });
  }, [slug]);

  if (cargando) {
    return (
      <div className="container py-5">
        <Loader texto="Cargando perfil del artista..." />
      </div>
    );
  }

  if (!artista) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h3">Artista no encontrado</h1>
        <Link to="/artistas" className="btn btn-gold mt-3">
          Ver todos los artistas
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Breadcrumbs
        items={[
          { label: "Artistas", to: "/artistas" },
          { label: artista.nombre },
        ]}
      />

      <div className="row g-4 align-items-center bg-soft p-4 rounded-3 border mb-5">
        <div className="col-md-3 text-center">
          <img
            src={artista.fotoUrl}
            alt={`Retrato de ${artista.nombre}`}
            className="img-fluid rounded-circle shadow"
            style={{ width: "200px", height: "200px", objectFit: "cover" }}
          />
        </div>
        <div className="col-md-9">
          <span className="badge bg-dark mb-2">{artista.estilo}</span>
          <h1 className="h2 mb-1">{artista.nombre}</h1>
          <p className="text-gold fw-semibold mb-2">
            <i className="bi bi-geo-alt me-1" aria-hidden="true"></i>
            {artista.ciudad}, {artista.pais}
          </p>
          <p className="mb-2">{artista.biografia}</p>
          <p className="small text-muted mb-0">
            <strong>Trayectoria y distinciones:</strong> {artista.trayectoria}
          </p>
        </div>
      </div>

      <section aria-label={`Obras de ${artista.nombre}`}>
        <h2 className="h4 mb-3">
          Obras Asociadas a {artista.nombre} ({artista.obras?.length || 0})
        </h2>
        <div className="catalog-grid">
          {(artista.obras || []).map((obra) => (
            <ObraCard key={obra.id} obra={{ ...obra, artista }} />
          ))}
        </div>
      </section>
    </div>
  );
};
