import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EMPRESA, formatearMonedaCOP, formatearFechaES } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Loader from "../components/crud/Loader";

/**
 * Catálogo de Cursos y Talleres (/cursos)
 * Diseñado según el perfil de Valeria (estudiante de 22 años):
 * Filtra por Nivel (Principiante, Intermedio, Avanzado) y Modalidad (Presencial, Virtual),
 * mostrando horarios claros, materiales y trayectoria del instructor.
 */
const CursosPage = () => {
  const [cursos, setCursos] = useState([]);
  const [nivel, setNivel] = useState("Todos");
  const [modalidad, setModalidad] = useState("Todas");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    const params = new URLSearchParams();
    if (nivel !== "Todos") params.set("nivel", nivel);
    if (modalidad !== "Todas") params.set("modalidad", modalidad);

    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/cursos?${params.toString()}`)
      .then((res) => {
        if (!res.err) setCursos(res.datos || []);
        setCargando(false);
      });
  }, [nivel, modalidad]);

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Cursos y Talleres" }]} />

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Cursos y Talleres de Formación Artística</h1>
          <p className="text-muted small mb-0">
            Horarios flexibles, lista transparente de materiales y acompañamiento de artistas con trayectoria.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            aria-label="Filtrar por nivel"
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
          >
            <option value="Todos">Todos los niveles</option>
            <option value="Principiante">Nivel Principiante</option>
            <option value="Intermedio">Nivel Intermedio</option>
            <option value="Avanzado">Nivel Avanzado</option>
          </select>

          <select
            className="form-select form-select-sm"
            style={{ width: "auto" }}
            aria-label="Filtrar por modalidad"
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value)}
          >
            <option value="Todas">Presencial y Virtual</option>
            <option value="Presencial">Solo Presencial</option>
            <option value="Virtual">Solo Virtual</option>
          </select>
        </div>
      </div>

      {cargando ? (
        <Loader texto="Cargando oferta de talleres..." />
      ) : (
        <div className="row g-4">
          {cursos.map((curso) => (
            <div key={curso.id} className="col-lg-6">
              <article className="card h-100 shadow-sm border-0">
                <div className="row g-0 h-100">
                  <div className="col-md-5">
                    <img
                      src={curso.imagenUrl}
                      alt={`Curso ${curso.titulo}`}
                      className="w-100 h-100 rounded-start"
                      style={{ objectFit: "cover", minHeight: "230px" }}
                      loading="lazy"
                    />
                  </div>
                  <div className="col-md-7">
                    <div className="card-body d-flex flex-column justify-content-between h-100">
                      <div>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          <span className="badge bg-dark">{curso.nivel}</span>
                          <span className="badge bg-secondary">{curso.modalidad}</span>
                          <span className="badge bg-warning text-dark">{curso.tecnica}</span>
                        </div>
                        <h2 className="h5 mb-1">{curso.titulo}</h2>
                        <p className="small text-muted mb-2">{curso.descripcion}</p>
                        <ul className="list-unstyled small mb-3">
                          <li>
                            <strong>Instructor(a):</strong> {curso.instructor}
                          </li>
                          <li>
                            <strong>Horario:</strong> {curso.horario}
                          </li>
                          <li>
                            <strong>Duración:</strong> {curso.duracion} (Inicia:{" "}
                            {formatearFechaES(curso.fechaInicio)})
                          </li>
                          <li>
                            <strong>Cupos disponibles:</strong> {curso.cuposDisponibles} de{" "}
                            {curso.cuposTotales}
                          </li>
                        </ul>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span className="fs-5 fw-bold text-dark">
                          {formatearMonedaCOP(curso.precio)}
                        </span>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/cursos/${curso.id}`}
                            className="btn btn-outline-dark btn-sm"
                          >
                            Materiales y temario
                          </Link>
                          <Link
                            to={`/cursos/${curso.id}/inscripcion`}
                            className="btn btn-gold btn-sm"
                          >
                            Inscribirme
                          </Link>
                        </div>
                      </div>
                    </div>
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

export default CursosPage;
