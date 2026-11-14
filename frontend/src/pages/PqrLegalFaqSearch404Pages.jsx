import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EMPRESA, formatearMonedaCOP, formatearFechaES } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import {
  validarNombre,
  validarDocumento,
  validarCorreo,
  validarCelularColombiano,
} from "../utils/validadores";
import Breadcrumbs from "../components/common/Breadcrumbs";
import ObraCard from "../components/common/ObraCard";
import Loader from "../components/crud/Loader";

/**
 * Página de PQR (/pqr)
 * Cumple el punto 3A.i:
 * - Tipos: Petición, Queja, Reclamo y Sugerencia.
 * - Se guarda en la base de datos SQLite y genera número de radicado (ej. PQR-2026-1004).
 * - El usuario puede consultar el estado y la respuesta oficial con su número de radicado.
 * - Incluye casilla obligatoria de aceptación de tratamiento de datos personales.
 */
export const PqrPage = () => {
  const [form, setForm] = useState({
    tipo: "Petición",
    nombre: "",
    documento: "",
    correo: "",
    celular: "",
    asunto: "",
    mensaje: "",
    aceptaDatos: false,
  });

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [radicadoCreado, setRadicadoCreado] = useState(null);

  const [radicadoConsulta, setRadicadoConsulta] = useState("PQR-2026-1001");
  const [resultadoConsulta, setResultadoConsulta] = useState(null);
  const [errorConsulta, setErrorConsulta] = useState(null);

  const validar = () => {
    const err = {};
    if (!validarNombre(form.nombre)) {
      err.nombre = "El nombre solo debe contener letras y espacios.";
    }
    if (!validarDocumento(form.documento)) {
      err.documento = "El documento debe tener entre 6 y 10 dígitos numéricos.";
    }
    if (!validarCorreo(form.correo)) {
      err.correo = "Introduce un correo electrónico válido.";
    }
    if (!validarCelularColombiano(form.celular)) {
      err.celular = "El celular debe ser colombiano de 10 dígitos e iniciar en 3.";
    }
    if (form.asunto.trim().length < 5) {
      err.asunto = "El asunto debe tener al menos 5 caracteres.";
    }
    if (form.mensaje.trim().length < 10) {
      err.mensaje = "Describe tu solicitud con al menos 10 caracteres.";
    }
    if (!form.aceptaDatos) {
      err.aceptaDatos = "Debes autorizar el tratamiento de datos personales.";
    }
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleRadicar = (e) => {
    e.preventDefault();
    if (!validar()) return;

    setEnviando(true);
    helpFetch()
      .post(`${EMPRESA.apiBaseUrl}/pqr`, { body: form })
      .then((res) => {
        if (!res.err && res.pqr) {
          setRadicadoCreado(res.pqr);
          setRadicadoConsulta(res.pqr.radicado);
          setResultadoConsulta(res.pqr);
          setForm({
            tipo: "Petición",
            nombre: "",
            documento: "",
            correo: "",
            celular: "",
            asunto: "",
            mensaje: "",
            aceptaDatos: false,
          });
        } else {
          setErrores({ general: res.statusText || "Error al radicar la PQR." });
        }
        setEnviando(false);
      });
  };

  const handleConsultar = (e) => {
    if (e) e.preventDefault();
    if (!radicadoConsulta.trim()) return;
    setErrorConsulta(null);
    helpFetch()
      .get(
        `${EMPRESA.apiBaseUrl}/pqr/radicado/${encodeURIComponent(
          radicadoConsulta.trim()
        )}`
      )
      .then((res) => {
        if (!res.err && res.pqr) {
          setResultadoConsulta(res.pqr);
        } else {
          setResultadoConsulta(null);
          setErrorConsulta(res.statusText || "Radicado no encontrado.");
        }
      });
  };

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Sistema de PQR (Peticiones, Quejas, Reclamos y Sugerencias)" }]} />

      <h1 className="h2 mb-2">Sistema de PQR y Consulta de Radicados</h1>
      <p className="text-muted small mb-4">
        Radica tus Peticiones, Quejas, Reclamos o Sugerencias y haz seguimiento en tiempo real con tu código único.
      </p>

      <div className="row g-4">
        {/* Formulario de radicación */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h4 mb-3">1. Radicar Nueva Solicitud PQR</h2>

            {radicadoCreado && (
              <div className="alert alert-success" role="status">
                <h3 className="h6 fw-bold mb-1">
                  ¡Solicitud radicada con éxito! Número de radicado:{" "}
                  <span className="badge bg-dark fs-6">{radicadoCreado.radicado}</span>
                </h3>
                <p className="small mb-0">
                  Guarda este código para consultar el estado y la respuesta de la galería.
                </p>
              </div>
            )}

            {errores.general && (
              <div className="alert alert-danger small">{errores.general}</div>
            )}

            <form onSubmit={handleRadicar} noValidate>
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="pqr-tipo" className="form-label small fw-semibold">
                    Tipo de solicitud *
                  </label>
                  <select
                    id="pqr-tipo"
                    className="form-select"
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  >
                    <option value="Petición">Petición</option>
                    <option value="Queja">Queja</option>
                    <option value="Reclamo">Reclamo</option>
                    <option value="Sugerencia">Sugerencia</option>
                  </select>
                </div>

                <div className="col-md-8">
                  <label htmlFor="pqr-nombre" className="form-label small fw-semibold">
                    Nombre completo *
                  </label>
                  <input
                    id="pqr-nombre"
                    type="text"
                    className={`form-control ${errores.nombre ? "is-invalid" : ""}`}
                    placeholder="Ej. Carlos Andrés Mendoza"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                  {errores.nombre && (
                    <div className="invalid-feedback">{errores.nombre}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <label htmlFor="pqr-doc" className="form-label small fw-semibold">
                    Documento (6-10 dígitos) *
                  </label>
                  <input
                    id="pqr-doc"
                    type="text"
                    className={`form-control ${errores.documento ? "is-invalid" : ""}`}
                    placeholder="1020765432"
                    value={form.documento}
                    onChange={(e) => setForm({ ...form, documento: e.target.value })}
                  />
                  {errores.documento && (
                    <div className="invalid-feedback">{errores.documento}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <label htmlFor="pqr-cel" className="form-label small fw-semibold">
                    Celular colombiano *
                  </label>
                  <input
                    id="pqr-cel"
                    type="tel"
                    className={`form-control ${errores.celular ? "is-invalid" : ""}`}
                    placeholder="3154829103"
                    value={form.celular}
                    onChange={(e) => setForm({ ...form, celular: e.target.value })}
                  />
                  {errores.celular && (
                    <div className="invalid-feedback">{errores.celular}</div>
                  )}
                </div>

                <div className="col-md-4">
                  <label htmlFor="pqr-correo" className="form-label small fw-semibold">
                    Correo electrónico *
                  </label>
                  <input
                    id="pqr-correo"
                    type="email"
                    className={`form-control ${errores.correo ? "is-invalid" : ""}`}
                    placeholder="usuario@correo.co"
                    value={form.correo}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  />
                  {errores.correo && (
                    <div className="invalid-feedback">{errores.correo}</div>
                  )}
                </div>

                <div className="col-12">
                  <label htmlFor="pqr-asunto" className="form-label small fw-semibold">
                    Asunto *
                  </label>
                  <input
                    id="pqr-asunto"
                    type="text"
                    className={`form-control ${errores.asunto ? "is-invalid" : ""}`}
                    placeholder="Ej. Consulta sobre certificado de obra o inscripción a curso"
                    value={form.asunto}
                    onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                  />
                  {errores.asunto && (
                    <div className="invalid-feedback">{errores.asunto}</div>
                  )}
                </div>

                <div className="col-12">
                  <label htmlFor="pqr-mensaje" className="form-label small fw-semibold">
                    Descripción detallada *
                  </label>
                  <textarea
                    id="pqr-mensaje"
                    rows="3"
                    className={`form-control ${errores.mensaje ? "is-invalid" : ""}`}
                    placeholder="Describe detalladamente tu petición, queja, reclamo o sugerencia..."
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  />
                  {errores.mensaje && (
                    <div className="invalid-feedback">{errores.mensaje}</div>
                  )}
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input
                      id="pqr-datos"
                      type="checkbox"
                      className={`form-check-input ${errores.aceptaDatos ? "is-invalid" : ""}`}
                      checked={form.aceptaDatos}
                      onChange={(e) =>
                        setForm({ ...form, aceptaDatos: e.target.checked })
                      }
                    />
                    <label htmlFor="pqr-datos" className="form-check-label small">
                      Autorizo el tratamiento de mis datos personales conforme a la{" "}
                      <Link to="/politica-de-datos" target="_blank" className="text-gold">
                        Política de Tratamiento de Datos (Ley 1581 de 2012)
                      </Link>{" "}
                      *
                    </label>
                    {errores.aceptaDatos && (
                      <div className="invalid-feedback d-block">{errores.aceptaDatos}</div>
                    )}
                  </div>
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-gold" disabled={enviando}>
                    {enviando ? "Generando radicado..." : "Radicar solicitud PQR"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Consulta de estado por radicado */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 p-4 bg-soft">
            <h2 className="h4 mb-3">2. Consultar Estado por Radicado</h2>
            <p className="small text-muted mb-3">
              Ingresa tu número de radicado (puedes probar con <code>PQR-2026-1001</code>,{" "}
              <code>PQR-2026-1002</code> o <code>PQR-2026-1003</code>).
            </p>

            <form onSubmit={handleConsultar} className="input-group mb-3">
              <label htmlFor="consulta-radicado" className="visually-hidden">
                Número de radicado
              </label>
              <input
                id="consulta-radicado"
                type="text"
                className="form-control"
                placeholder="PQR-2026-1001"
                value={radicadoConsulta}
                onChange={(e) => setRadicadoConsulta(e.target.value)}
              />
              <button type="submit" className="btn btn-dark">
                Consultar
              </button>
            </form>

            {errorConsulta && (
              <div className="alert alert-danger small">{errorConsulta}</div>
            )}

            {resultadoConsulta && (
              <div className="p-3 bg-white rounded border shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">{resultadoConsulta.radicado}</span>
                  <span
                    className={`badge ${
                      resultadoConsulta.estado === "Resuelta"
                        ? "bg-success"
                        : resultadoConsulta.estado === "En trámite"
                        ? "bg-warning text-dark"
                        : "bg-secondary"
                    }`}
                  >
                    {resultadoConsulta.estado}
                  </span>
                </div>
                <div className="small mb-1">
                  <strong>Tipo:</strong> {resultadoConsulta.tipo}
                </div>
                <div className="small mb-1">
                  <strong>Solicitante:</strong> {resultadoConsulta.nombre}
                </div>
                <div className="small mb-2">
                  <strong>Asunto:</strong> {resultadoConsulta.asunto}
                </div>
                <div className="small text-muted border-top pt-2">
                  <strong>Respuesta oficial:</strong>{" "}
                  {resultadoConsulta.respuesta ||
                    "Tu solicitud se encuentra en revisión por el comité de atención al usuario."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Página Política de Tratamiento de Datos Personales (/politica-de-datos)
 * Cumple el punto 3A.n: Ley 1581 de 2012 y Decreto 1377 de 2013 (Colombia).
 */
export const PoliticaDatosPage = () => {
  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Política de Tratamiento de Datos Personales" }]} />

      <article className="card shadow-sm border-0 p-4 p-md-5">
        <span className="text-gold fw-bold text-uppercase small">
          Cumplimiento Normativo Colombiano · Ley 1581 de 2012 y Decreto 1377 de 2013
        </span>
        <h1 className="h2 mb-4">Política de Tratamiento y Protección de Datos Personales</h1>

        <section className="mb-4">
          <h2 className="h5 text-gold">1. Identificación del Responsable del Tratamiento</h2>
          <p className="small">
            <strong>Razón Social:</strong> {EMPRESA.responsableDatos} (NIT {EMPRESA.nit})<br />
            <strong>Domicilio y Dirección:</strong> {EMPRESA.direccion}<br />
            <strong>Correo de Protección de Datos:</strong> {EMPRESA.correoPrivacidad}<br />
            <strong>Teléfono:</strong> {EMPRESA.telefono}
          </p>
        </section>

        <section className="mb-4">
          <h2 className="h5 text-gold">2. Finalidades del Tratamiento de los Datos</h2>
          <ul className="small">
            <li>Procesar la compra de obras de arte originales, despacho asegurado y facturación electrónica.</li>
            <li>Gestionar la inscripción académica a cursos y talleres presenciales o virtuales.</li>
            <li>Confirmar reservas de aforo para exposiciones curatoriales y eventos culturales.</li>
            <li>Dar trámite y respuesta oportuna a Peticiones, Quejas, Reclamos y Sugerencias (PQR).</li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="h5 text-gold">3. Derechos de los Titulares (Derechos ARCO / Habeas Data)</h2>
          <p className="small">
            De conformidad con el artículo 8 de la Ley 1581 de 2012, el titular de los datos personales tiene derecho a:
          </p>
          <ul className="small">
            <li><strong>Acceso y Conocimiento:</strong> Conocer de forma gratuita sus datos personales objeto de tratamiento.</li>
            <li><strong>Rectificación y Actualización:</strong> Actualizar y rectificar sus datos frente a información parcial, inexacta o incompleta.</li>
            <li><strong>Cancelación / Supresión:</strong> Solicitar la supresión de sus datos o revocar la autorización otorgada cuando no exista un deber legal o contractual de permanecer en la base de datos.</li>
            <li><strong>Oposición y Queja:</strong> Presentar consultas o reclamos ante la galería y ante la Superintendencia de Industria y Comercio (SIC).</li>
          </ul>
        </section>

        <section className="mb-4">
          <h2 className="h5 text-gold">4. Canal de Atención y Procedimiento para Ejercer Derechos</h2>
          <p className="small">
            Los titulares podrán ejercer sus derechos enviando una solicitud al correo{" "}
            <strong>{EMPRESA.correoPrivacidad}</strong> o radicando una solicitud formal en el módulo{" "}
            <Link to="/pqr" className="text-gold fw-semibold">
              Sistema de PQR (/pqr)
            </Link>
            . Las consultas serán atendidas en un término máximo de diez (10) días hábiles y los reclamos en quince (15) días hábiles.
          </p>
        </section>

        <section>
          <h2 className="h5 text-gold">5. Vigencia de la Política y de las Bases de Datos</h2>
          <p className="small mb-0">
            La presente política rige a partir del 1 de agosto de 2026 y las bases de datos se conservarán durante el tiempo necesario para cumplir las finalidades contractuales, académicas y fiscales aplicables en la República de Colombia.
          </p>
        </section>
      </article>
    </div>
  );
};

/**
 * Página de Preguntas Frecuentes (/preguntas-frecuentes)
 * Cumple la Heurística #10 de Nielsen (Ayuda y documentación).
 */
export const PreguntasFrecuentesPage = () => {
  const faqs = [
    {
      pregunta: "¿Todas las obras incluyen certificado de autenticidad?",
      respuesta:
        "Sí. Cada pintura, escultura, fotografía o grabado adquirido en Galería Prismas se entrega con certificado físico firmado por el artista y por la dirección curatorial, además de su factura electrónica.",
    },
    {
      pregunta: "¿Qué tarjetas de prueba puedo usar en la pasarela académica?",
      respuesta:
        "En el paso 3 del Checkout puedes hacer clic en los botones rápidos de demostración: 4242424242424242 (Pago Aprobado), 4000000000000000 (Tarjeta Rechazada) y 5105105105101111 (Fondos Insuficientes).",
    },
    {
      pregunta: "¿Debo llevar materiales a los cursos y talleres?",
      respuesta:
        "En la ficha de cada taller (/cursos/:id) encontrarás el apartado detallado de materiales. Los talleres de nivel principiante incluyen el kit inicial en la primera sesión.",
    },
    {
      pregunta: "¿Cómo consulto el estado de una PQR?",
      respuesta:
        "Ingresa a la página /pqr, escribe tu número de radicado (por ejemplo PQR-2026-1001) en el buscador derecho y verás de inmediato si está Radicada, En trámite o Resuelta.",
    },
    {
      pregunta: "¿Cómo funciona el asistente Prisma IA?",
      respuesta:
        "Haz clic en el botón flotante 'Prisma IA' abajo a la derecha. Puedes indicarle tu presupuesto (ej. menos de 2 millones), técnica (óleo, escultura, fotografía) o espacio (sala, estudio) y te recomendará obras disponibles reales del catálogo.",
    },
  ];

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Preguntas Frecuentes (Ayuda y Documentación)" }]} />

      <h1 className="h2 mb-2">Centro de Ayuda y Preguntas Frecuentes</h1>
      <p className="text-muted small mb-4">
        Respuestas rápidas sobre compra de obras, talleres, reservas de exposiciones y pasarela de demostración.
      </p>

      <div className="row g-3">
        {faqs.map((item, idx) => (
          <div key={idx} className="col-md-6">
            <div className="card shadow-sm border-0 p-4 h-100">
              <h2 className="h5 text-gold mb-2">{item.pregunta}</h2>
              <p className="small text-muted mb-0">{item.respuesta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Página de Resultados de Búsqueda Global Agrupados (/buscar?q=)
 * Cumple la rúbrica 3B (Sistema de navegación y búsqueda):
 * Resultados agrupados en Obras, Artistas, Cursos y Exposiciones.
 */
export const BuscarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qInicial = searchParams.get("q") || "";
  const [termino, setTermino] = useState(qInicial);
  const [resultados, setResultados] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setTermino(q);
    if (!q.trim()) {
      setResultados(null);
      return;
    }
    setCargando(true);
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/buscar?q=${encodeURIComponent(q)}`)
      .then((res) => {
        if (!res.err) setResultados(res);
        setCargando(false);
      });
  }, [searchParams]);

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: `Búsqueda Global: "${qInicial}"` }]} />

      <h1 className="h2 mb-3">Resultados de Búsqueda Global</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchParams({ q: termino });
        }}
        className="input-group mb-4"
      >
        <label htmlFor="buscar-input-page" className="visually-hidden">
          Término de búsqueda
        </label>
        <input
          id="buscar-input-page"
          type="search"
          className="form-control"
          placeholder="Buscar por nombre de obra, técnica, artista, curso o exposición..."
          value={termino}
          onChange={(e) => setTermino(e.target.value)}
        />
        <button type="submit" className="btn btn-gold">
          Buscar
        </button>
      </form>

      {/* Búsquedas sugeridas (Heurística #6) */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-4 small">
        <span className="text-muted">Búsquedas sugeridas:</span>
        {["Óleo", "Valentina Restrepo", "Barichara", "Páramo", "Acuarela", "Andes"].map(
          (sug) => (
            <button
              key={sug}
              type="button"
              className="btn btn-outline-secondary btn-sm py-0"
              onClick={() => setSearchParams({ q: sug })}
            >
              {sug}
            </button>
          )
        )}
      </div>

      {cargando && <Loader texto="Buscando en obras, artistas, cursos y exposiciones..." />}

      {resultados && !cargando && (
        <div className="d-flex flex-column gap-5">
          {/* 1. Obras */}
          <section aria-label="Resultados en Obras de Arte">
            <h2 className="h4 border-bottom pb-2 mb-3">
              Obras de Arte ({resultados.obras?.length || 0})
            </h2>
            {resultados.obras?.length > 0 ? (
              <div className="catalog-grid">
                {resultados.obras.map((o) => (
                  <ObraCard key={o.id} obra={o} />
                ))}
              </div>
            ) : (
              <p className="small text-muted">No se encontraron obras con ese término.</p>
            )}
          </section>

          {/* 2. Artistas */}
          <section aria-label="Resultados en Artistas">
            <h2 className="h4 border-bottom pb-2 mb-3">
              Artistas ({resultados.artistas?.length || 0})
            </h2>
            {resultados.artistas?.length > 0 ? (
              <div className="row g-3">
                {resultados.artistas.map((a) => (
                  <div key={a.id} className="col-md-4">
                    <div className="card p-3 border-0 shadow-sm">
                      <h3 className="h6 mb-1">{a.nombre}</h3>
                      <p className="small text-muted mb-2">
                        {a.estilo} · {a.ciudad}
                      </p>
                      <Link to={`/artistas/${a.slug}`} className="small text-gold fw-semibold">
                        Ver perfil del artista →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small text-muted">No se encontraron artistas con ese término.</p>
            )}
          </section>

          {/* 3. Cursos */}
          <section aria-label="Resultados en Cursos y Talleres">
            <h2 className="h4 border-bottom pb-2 mb-3">
              Cursos y Talleres ({resultados.cursos?.length || 0})
            </h2>
            {resultados.cursos?.length > 0 ? (
              <div className="row g-3">
                {resultados.cursos.map((c) => (
                  <div key={c.id} className="col-md-6">
                    <div className="card p-3 border-0 shadow-sm">
                      <h3 className="h6 mb-1">{c.titulo}</h3>
                      <p className="small text-muted mb-2">
                        Nivel {c.nivel} · {c.horario} · {formatearMonedaCOP(c.precio)}
                      </p>
                      <Link to={`/cursos/${c.id}`} className="small text-gold fw-semibold">
                        Ver taller e inscripción →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small text-muted">No se encontraron cursos con ese término.</p>
            )}
          </section>

          {/* 4. Exposiciones */}
          <section aria-label="Resultados en Exposiciones">
            <h2 className="h4 border-bottom pb-2 mb-3">
              Exposiciones ({resultados.exposiciones?.length || 0})
            </h2>
            {resultados.exposiciones?.length > 0 ? (
              <div className="row g-3">
                {resultados.exposiciones.map((e) => (
                  <div key={e.id} className="col-md-6">
                    <div className="card p-3 border-0 shadow-sm">
                      <h3 className="h6 mb-1">{e.titulo}</h3>
                      <p className="small text-muted mb-2">
                        {e.estado} · {formatearFechaES(e.fechaInicio)}
                      </p>
                      <Link to={`/exposiciones/${e.id}`} className="small text-gold fw-semibold">
                        Ver exposición y reservar →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small text-muted">No se encontraron exposiciones con ese término.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

/**
 * Página 404 Amigable (*)
 * Cumple la sección 4 y la Heurística #9 de Nielsen (Ayudar a reconocer y recuperarse de errores).
 */
export const NotFoundPage = () => {
  return (
    <div className="container py-5 text-center">
      <div className="p-5 bg-soft rounded-3 border mx-auto" style={{ maxWidth: "680px" }}>
        <span className="display-3 fw-bold text-gold">404</span>
        <h1 className="h2 mt-2 mb-3">Esta sala u obra no existe en nuestro recorrido</h1>
        <p className="text-muted mb-4">
          Es posible que el enlace haya cambiado o que hayas escrito una dirección incorrecta. Usa los siguientes accesos rápidos para continuar tu visita:
        </p>
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <Link to="/" className="btn btn-gold">
            Ir al Inicio
          </Link>
          <Link to="/obras" className="btn btn-outline-dark">
            Catálogo de Obras
          </Link>
          <Link to="/exposiciones" className="btn btn-outline-dark">
            Exposiciones
          </Link>
          <Link to="/cursos" className="btn btn-outline-dark">
            Cursos y Talleres
          </Link>
          <Link to="/buscar?q=Óleo" className="btn btn-outline-secondary">
            Buscar Obras
          </Link>
        </div>
      </div>
    </div>
  );
};
