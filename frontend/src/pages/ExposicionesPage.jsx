import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EMPRESA, formatearMonedaCOP, formatearFechaES } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Loader from "../components/crud/Loader";

/**
 * Página de Exposiciones y Eventos (/exposiciones)
 * Filtra por estado (En curso, Próximo, Finalizado) y muestra calendario curatorial.
 */
const ExposicionesPage = () => {
  const [exposiciones, setExposiciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    const query = filtroEstado !== "Todos" ? `?estado=${encodeURIComponent(filtroEstado)}` : "";
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/exposiciones${query}`)
      .then((res) => {
        if (!res.err) setExposiciones(res.datos || []);
        setCargando(false);
      });
  }, [filtroEstado]);

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Exposiciones y Agenda" }]} />

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Agenda de Exposiciones y Eventos</h1>
          <p className="text-muted small mb-0">
            Muestras curatoriales en curso, próximas inauguraciones y reserva de entradas en línea.
          </p>
        </div>

        <div className="btn-group mt-2 mt-md-0" role="group" aria-label="Filtrar exposiciones por estado">
          {["Todos", "En curso", "Próximo", "Finalizado"].map((est) => (
            <button
              key={est}
              type="button"
              className={`btn btn-sm ${
                filtroEstado === est ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setFiltroEstado(est)}
            >
              {est === "Todos" ? "Todas" : est}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <Loader texto="Cargando agenda de exposiciones..." />
      ) : (
        <div className="row g-4 mb-5">
          {exposiciones.map((exp) => (
            <div key={exp.id} className="col-md-6">
              <article className="card h-100 shadow-sm border-0 overflow-hidden">
                <div className="row g-0 h-100">
                  <div className="col-sm-5">
                    <img
                      src={exp.imagenUrl}
                      alt={`Exposición ${exp.titulo}`}
                      className="w-100 h-100"
                      style={{ objectFit: "cover", minHeight: "220px" }}
                      loading="lazy"
                    />
                  </div>
                  <div className="col-sm-7">
                    <div className="card-body d-flex flex-column justify-content-between h-100">
                      <div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span
                            className={`badge ${
                              exp.estado === "En curso"
                                ? "bg-success"
                                : exp.estado === "Próximo"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                          >
                            {exp.estado}
                          </span>
                          <span className="small text-muted">
                            {exp.precioEntrada === 0
                              ? "Entrada libre"
                              : formatearMonedaCOP(exp.precioEntrada)}
                          </span>
                        </div>
                        <h2 className="h5 mb-1">{exp.titulo}</h2>
                        <p className="small text-gold fw-semibold mb-2">{exp.subtitulo}</p>
                        <p className="small text-muted mb-2">{exp.descripcion}</p>
                        <ul className="list-unstyled small mb-3">
                          <li>
                            <strong>Fechas:</strong> {formatearFechaES(exp.fechaInicio)} al{" "}
                            {formatearFechaES(exp.fechaFin)}
                          </li>
                          <li>
                            <strong>Sala:</strong> {exp.sala}
                          </li>
                          <li>
                            <strong>Cupos disponibles:</strong> {exp.cuposDisponibles} /{" "}
                            {exp.cupoMaximo}
                          </li>
                        </ul>
                      </div>
                      <Link
                        to={`/exposiciones/${exp.id}`}
                        className="btn btn-gold btn-sm align-self-start"
                      >
                        {exp.estado === "Finalizado"
                          ? "Ver archivo curatorial"
                          : "Seleccionar fecha y reservar entradas"}
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {/* Calendario resumido de temporada */}
      <section className="card border-0 shadow-sm p-4 bg-soft" aria-label="Calendario de exposiciones">
        <h2 className="h4 mb-3">
          <i className="bi bi-calendar-week text-gold me-2" aria-hidden="true"></i>
          Calendario Curatorial 2026 - 2027
        </h2>
        <div className="table-responsive">
          <table className="table table-hover bg-white rounded overflow-hidden mb-0">
            <thead className="table-dark">
              <tr>
                <th scope="col">Exposición</th>
                <th scope="col">Curaduría</th>
                <th scope="col">Sala</th>
                <th scope="col">Vigencia</th>
                <th scope="col">Estado</th>
                <th scope="col" className="text-end">
                  Reserva
                </th>
              </tr>
            </thead>
            <tbody>
              {exposiciones.map((exp) => (
                <tr key={exp.id}>
                  <td className="fw-semibold">{exp.titulo}</td>
                  <td>{exp.curador}</td>
                  <td>{exp.sala}</td>
                  <td>
                    {formatearFechaES(exp.fechaInicio)} — {formatearFechaES(exp.fechaFin)}
                  </td>
                  <td>
                    <span className="badge bg-dark">{exp.estado}</span>
                  </td>
                  <td className="text-end">
                    <Link to={`/exposiciones/${exp.id}`} className="btn btn-outline-dark btn-sm">
                      Ver / Reservar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ExposicionesPage;
