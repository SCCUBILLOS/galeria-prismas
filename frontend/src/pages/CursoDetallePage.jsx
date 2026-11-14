import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { EMPRESA, formatearMonedaCOP, formatearFechaES } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import {
  validarNombre,
  validarDocumento,
  validarCorreo,
  validarCelularColombiano,
} from "../utils/validadores";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Loader from "../components/crud/Loader";

/**
 * Detalle de Curso e Inscripción (/cursos/:id y /cursos/:id/inscripcion)
 * Flujo 1.4: Inicio → Cursos → Seleccionar curso → Ver horarios, contenido y materiales → "Inscribirme" → Formulario → Confirmación.
 */
const CursoDetallePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const enfocarFormulario = location.pathname.endsWith("/inscripcion");

  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  const [errores, setErrores] = useState({});

  const [form, setForm] = useState({
    nombreEstudiante: "",
    documento: "",
    correo: "",
    celular: "",
    experienciaPrevia: "Principiante (sin experiencia previa)",
    motivacion: "",
    aceptaDatos: false,
  });

  useEffect(() => {
    setCargando(true);
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/cursos/${id}`)
      .then((res) => {
        if (!res.err && res.curso) {
          setCurso(res.curso);
        }
        setCargando(false);
      });
  }, [id]);

  const validar = () => {
    const err = {};
    if (!validarNombre(form.nombreEstudiante)) {
      err.nombreEstudiante = "Ingresa tu nombre completo usando solo letras y espacios.";
    }
    if (!validarDocumento(form.documento)) {
      err.documento = "El documento debe ser numérico de 6 a 10 dígitos.";
    }
    if (!validarCorreo(form.correo)) {
      err.correo = "Introduce un correo electrónico válido.";
    }
    if (!validarCelularColombiano(form.celular)) {
      err.celular = "El celular debe ser colombiano de 10 dígitos e iniciar en 3 (ej. 3108472910).";
    }
    if (!form.aceptaDatos) {
      err.aceptaDatos = "Debes autorizar el tratamiento de datos personales (Ley 1581 de 2012).";
    }
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    helpFetch()
      .post(`${EMPRESA.apiBaseUrl}/cursos/${curso.id}/inscribir`, { body: form })
      .then((res) => {
        if (!res.err && res.inscripcion) {
          setConfirmacion(res.inscripcion);
          setCurso((prev) => ({
            ...prev,
            cuposDisponibles: Math.max(0, prev.cuposDisponibles - 1),
          }));
        } else {
          setErrores({ general: res.statusText || "No fue posible procesar la inscripción." });
        }
        setEnviando(false);
      });
  };

  if (cargando) {
    return (
      <div className="container py-5">
        <Loader texto="Cargando programa del taller..." />
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h3">Curso no encontrado</h1>
        <Link to="/cursos" className="btn btn-gold mt-3">
          Volver a cursos y talleres
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Breadcrumbs
        items={[
          { label: "Cursos y Talleres", to: "/cursos" },
          { label: curso.titulo, to: `/cursos/${curso.id}` },
          ...(enfocarFormulario ? [{ label: "Formulario de Inscripción" }] : []),
        ]}
      />

      <div className="row g-5">
        <div className="col-lg-7">
          <img
            src={curso.imagenUrl}
            alt={`Taller ${curso.titulo}`}
            className="img-fluid rounded-3 shadow-sm mb-4 w-100"
            style={{ maxHeight: "380px", objectFit: "cover" }}
          />

          <div className="d-flex flex-wrap gap-2 mb-2">
            <span className="badge bg-dark">Nivel: {curso.nivel}</span>
            <span className="badge bg-secondary">Modalidad: {curso.modalidad}</span>
            <span className="badge bg-warning text-dark">Técnica: {curso.tecnica}</span>
          </div>

          <h1 className="h2 mb-2">{curso.titulo}</h1>
          <p className="lead text-muted">{curso.descripcion}</p>

          <div className="p-3 bg-soft rounded border mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="small text-muted d-block">Inversión total del programa</span>
                <span className="display-6 fw-bold text-dark">
                  {formatearMonedaCOP(curso.precio)}
                </span>
              </div>
              <div className="text-end">
                <span className="badge bg-success mb-1">
                  {curso.cuposDisponibles} cupos disponibles
                </span>
                <div className="small text-muted">
                  Inicia: {formatearFechaES(curso.fechaInicio)}
                </div>
              </div>
            </div>
          </div>

          <section className="mb-4" aria-label="Horarios y duración">
            <h2 className="h5 text-gold">1. Horarios y Modalidad</h2>
            <p className="mb-1">
              <strong>Horario:</strong> {curso.horario}
            </p>
            <p className="mb-0">
              <strong>Duración:</strong> {curso.duracion} ({curso.modalidad})
            </p>
          </section>

          <section className="mb-4" aria-label="Materiales requeridos">
            <h2 className="h5 text-gold">2. ¿Qué materiales debes llevar o incluye el taller?</h2>
            <div className="p-3 bg-soft rounded border small">{curso.materiales}</div>
          </section>

          <section className="mb-4" aria-label="Contenido y temario">
            <h2 className="h5 text-gold">3. Contenido y Módulos</h2>
            <p className="small">{curso.temario}</p>
          </section>

          <section className="p-3 bg-soft rounded border" aria-label="Trayectoria del instructor">
            <h2 className="h5 text-gold">4. Sobre el Instructor(a): {curso.instructor}</h2>
            <p className="small mb-0">{curso.bioInstructor}</p>
          </section>
        </div>

        {/* Formulario de inscripción en pocos pasos */}
        <div className="col-lg-5" id="formulario-inscripcion">
          <div className="card shadow-sm border-0 p-4 sticky-lg-top" style={{ top: "5.5rem" }}>
            <h2 className="h4 mb-2">
              <i className="bi bi-pencil-square text-gold me-2" aria-hidden="true"></i>
              Inscripción al Taller
            </h2>
            <p className="small text-muted mb-3">
              Completa tus datos en un solo paso y recibe tu código de cupo al instante.
            </p>

            {confirmacion ? (
              <div className="alert alert-success" role="status">
                <h3 className="h5 fw-bold">¡Inscripción Confirmada!</h3>
                <p className="small mb-2">
                  Código de matrícula: <strong>{confirmacion.codigoInscripcion}</strong>
                </p>
                <ul className="small mb-3">
                  <li>
                    <strong>Estudiante:</strong> {confirmacion.nombreEstudiante}
                  </li>
                  <li>
                    <strong>Taller:</strong> {curso.titulo}
                  </li>
                  <li>
                    <strong>Horario:</strong> {curso.horario}
                  </li>
                </ul>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  onClick={() => setConfirmacion(null)}
                >
                  Inscribir otro estudiante
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {errores.general && (
                  <div className="alert alert-danger small">{errores.general}</div>
                )}

                <div className="mb-3">
                  <label htmlFor="ins-nombre" className="form-label small fw-semibold">
                    Nombre completo del estudiante *
                  </label>
                  <input
                    id="ins-nombre"
                    type="text"
                    className={`form-control ${errores.nombreEstudiante ? "is-invalid" : ""}`}
                    placeholder="Ej. Valeria Sofía Castellanos"
                    value={form.nombreEstudiante}
                    onChange={(e) =>
                      setForm({ ...form, nombreEstudiante: e.target.value })
                    }
                    required
                  />
                  {errores.nombreEstudiante && (
                    <div className="invalid-feedback">{errores.nombreEstudiante}</div>
                  )}
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="ins-doc" className="form-label small fw-semibold">
                      Documento (6-10 dígitos) *
                    </label>
                    <input
                      id="ins-doc"
                      type="text"
                      className={`form-control ${errores.documento ? "is-invalid" : ""}`}
                      placeholder="1032984512"
                      value={form.documento}
                      onChange={(e) => setForm({ ...form, documento: e.target.value })}
                      required
                    />
                    {errores.documento && (
                      <div className="invalid-feedback">{errores.documento}</div>
                    )}
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="ins-cel" className="form-label small fw-semibold">
                      Celular colombiano *
                    </label>
                    <input
                      id="ins-cel"
                      type="tel"
                      className={`form-control ${errores.celular ? "is-invalid" : ""}`}
                      placeholder="3108472910"
                      value={form.celular}
                      onChange={(e) => setForm({ ...form, celular: e.target.value })}
                      required
                    />
                    {errores.celular && (
                      <div className="invalid-feedback">{errores.celular}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="ins-correo" className="form-label small fw-semibold">
                    Correo electrónico *
                  </label>
                  <input
                    id="ins-correo"
                    type="email"
                    className={`form-control ${errores.correo ? "is-invalid" : ""}`}
                    placeholder="estudiante@unilibre.edu.co"
                    value={form.correo}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                    required
                  />
                  {errores.correo && (
                    <div className="invalid-feedback">{errores.correo}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="ins-exp" className="form-label small fw-semibold">
                    Experiencia previa en la técnica
                  </label>
                  <select
                    id="ins-exp"
                    className="form-select"
                    value={form.experienciaPrevia}
                    onChange={(e) =>
                      setForm({ ...form, experienciaPrevia: e.target.value })
                    }
                  >
                    <option value="Principiante (sin experiencia previa)">
                      Principiante (sin experiencia previa)
                    </option>
                    <option value="Intermedio (he tomado talleres básicos)">
                      Intermedio (he tomado talleres básicos)
                    </option>
                    <option value="Avanzado (práctica constante)">
                      Avanzado (práctica constante)
                    </option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="ins-mot" className="form-label small fw-semibold">
                    ¿Qué te gustaría lograr en este taller? (Opcional)
                  </label>
                  <textarea
                    id="ins-mot"
                    rows="2"
                    className="form-control"
                    placeholder="Ej. Aprender mezcla de color y retrato..."
                    value={form.motivacion}
                    onChange={(e) => setForm({ ...form, motivacion: e.target.value })}
                  />
                </div>

                <div className="form-check mb-3">
                  <input
                    id="ins-datos"
                    type="checkbox"
                    className={`form-check-input ${errores.aceptaDatos ? "is-invalid" : ""}`}
                    checked={form.aceptaDatos}
                    onChange={(e) => setForm({ ...form, aceptaDatos: e.target.checked })}
                  />
                  <label htmlFor="ins-datos" className="form-check-label small">
                    Autorizo el tratamiento de mis datos personales según la{" "}
                    <Link to="/politica-de-datos" target="_blank" className="text-gold">
                      Política de Tratamiento de Datos (Ley 1581 de 2012)
                    </Link>{" "}
                    *
                  </label>
                  {errores.aceptaDatos && (
                    <div className="invalid-feedback d-block">{errores.aceptaDatos}</div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-gold w-100"
                  disabled={enviando || curso.cuposDisponibles <= 0}
                >
                  {enviando
                    ? "Procesando inscripción..."
                    : `Confirmar inscripción (${formatearMonedaCOP(curso.precio)})`}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CursoDetallePage;
