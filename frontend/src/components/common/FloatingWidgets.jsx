import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { EMPRESA, formatearMonedaCOP } from "../../config/empresa";
import { helpFetch } from "../../helpers/helpFetch";

/**
 * Widgets flotantes globales:
 * 1) Barra/Panel de Accesibilidad (punto 3A.o): aumentar/disminuir texto, alto contraste,
 *    fuente dislexia, resaltar enlaces, pausar animaciones y restablecer.
 * 2) Asistente Curatorial "Prisma IA" (punto 3A.j): chat conectado a /api/ia/chat con fallback local.
 * 3) Botón flotante de WhatsApp (punto 3A.g).
 * 4) Banner de Cookies y Privacidad (punto 3A.n).
 * 5) Toast con soporte de "Deshacer" (Heurísticas #1 y #3).
 */
const FloatingWidgets = () => {
  const {
    accesibilidad,
    aumentarTexto,
    disminuirTexto,
    toggleOpcionAccesibilidad,
    restablecerAccesibilidad,
    toast,
    setToast,
  } = useApp();

  const [abrirA11y, setAbrirA11y] = useState(false);
  const [abrirIA, setAbrirIA] = useState(false);
  const [consultaIA, setConsultaIA] = useState("");
  const [cargandoIA, setCargandoIA] = useState(false);
  const [mensajesIA, setMensajesIA] = useState([
    {
      autor: "ia",
      texto:
        "¡Hola! Soy Prisma IA, tu asistente curatorial. Cuéntame qué técnica te gusta (óleo, acrílico, escultura, fotografía), para qué espacio buscas obra y cuál es tu presupuesto aproximado.",
      obras: [],
    },
  ]);

  const [cookiesAceptadas, setCookiesAceptadas] = useState(() => {
    return localStorage.getItem("galeria_prismas_cookies_v1") === "true";
  });

  const aceptarCookies = () => {
    localStorage.setItem("galeria_prismas_cookies_v1", "true");
    setCookiesAceptadas(true);
  };

  const enviarConsultaIA = (textoDirecto) => {
    const prompt = (textoDirecto ?? consultaIA).trim();
    if (!prompt) return;

    setMensajesIA((prev) => [...prev, { autor: "usuario", texto: prompt }]);
    setConsultaIA("");
    setCargandoIA(true);

    helpFetch()
      .post(`${EMPRESA.apiBaseUrl}/ia/chat`, { body: { mensaje: prompt } })
      .then((res) => {
        if (!res.err) {
          setMensajesIA((prev) => [
            ...prev,
            {
              autor: "ia",
              texto: res.respuesta,
              origen: res.origen,
              obras: res.obrasRecomendadas || [],
            },
          ]);
        } else {
          setMensajesIA((prev) => [
            ...prev,
            {
              autor: "ia",
              texto: res.statusText || "Ocurrió un inconveniente al consultar el catálogo.",
              obras: [],
            },
          ]);
        }
        setCargandoIA(false);
      });
  };

  return (
    <>
      {/* 1. Notificación Toast con botón Deshacer (Heurísticas #1 y #3) */}
      {toast && (
        <div
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1100, marginTop: "4.5rem" }}
          role="status"
          aria-live="polite"
        >
          <div className={`alert alert-${toast.tipo} shadow d-flex align-items-center gap-2 mb-0`}>
            <i className="bi bi-info-circle-fill" aria-hidden="true"></i>
            <span>{toast.mensaje}</span>
            {toast.accionDeshacer && (
              <button
                type="button"
                className="btn btn-sm btn-dark ms-2"
                onClick={() => {
                  toast.accionDeshacer();
                  setToast(null);
                }}
              >
                Deshacer
              </button>
            )}
            <button
              type="button"
              className="btn-close ms-2"
              aria-label="Cerrar notificación"
              onClick={() => setToast(null)}
            ></button>
          </div>
        </div>
      )}

      {/* 2. Botón y Panel de Accesibilidad WCAG 2.1 (punto 3A.o) */}
      <button
        type="button"
        className="floating-a11y-btn no-print"
        onClick={() => setAbrirA11y(!abrirA11y)}
        aria-expanded={abrirA11y}
        aria-controls="panel-accesibilidad"
        aria-label="Abrir herramientas de accesibilidad"
      >
        <i className="bi bi-universal-access-circle me-1" aria-hidden="true"></i>
        Accesibilidad
      </button>

      {abrirA11y && (
        <aside
          id="panel-accesibilidad"
          className="floating-a11y-panel no-print"
          aria-label="Opciones de accesibilidad visual y de lectura"
        >
          <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <h2 className="h6 mb-0 fw-bold">
              <i className="bi bi-universal-access me-1" aria-hidden="true"></i>
              Accesibilidad WCAG 2.1
            </h2>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar panel de accesibilidad"
              onClick={() => setAbrirA11y(false)}
            ></button>
          </div>

          <div className="mb-3">
            <span className="small fw-semibold d-block mb-1">
              Tamaño del texto: {accesibilidad.escalaTexto}%
            </span>
            <div className="btn-group w-100" role="group" aria-label="Control de tamaño de fuente">
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                onClick={disminuirTexto}
              >
                A- Disminuir
              </button>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm"
                onClick={aumentarTexto}
              >
                A+ Aumentar
              </button>
            </div>
          </div>

          <div className="d-grid gap-2">
            <button
              type="button"
              className={`btn btn-sm text-start ${
                accesibilidad.altoContraste ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => toggleOpcionAccesibilidad("altoContraste")}
              aria-pressed={accesibilidad.altoContraste}
            >
              <i className="bi bi-circle-half me-2" aria-hidden="true"></i>
              Alto contraste
            </button>

            <button
              type="button"
              className={`btn btn-sm text-start ${
                accesibilidad.fuenteDislexia ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => toggleOpcionAccesibilidad("fuenteDislexia")}
              aria-pressed={accesibilidad.fuenteDislexia}
            >
              <i className="bi bi-fonts me-2" aria-hidden="true"></i>
              Fuente legible para dislexia
            </button>

            <button
              type="button"
              className={`btn btn-sm text-start ${
                accesibilidad.resaltarEnlaces ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => toggleOpcionAccesibilidad("resaltarEnlaces")}
              aria-pressed={accesibilidad.resaltarEnlaces}
            >
              <i className="bi bi-link-45deg me-2" aria-hidden="true"></i>
              Resaltar enlaces
            </button>

            <button
              type="button"
              className={`btn btn-sm text-start ${
                accesibilidad.pausarAnimaciones ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => toggleOpcionAccesibilidad("pausarAnimaciones")}
              aria-pressed={accesibilidad.pausarAnimaciones}
            >
              <i className="bi bi-pause-circle me-2" aria-hidden="true"></i>
              Pausar animaciones
            </button>

            <button
              type="button"
              className="btn btn-outline-danger btn-sm mt-1"
              onClick={restablecerAccesibilidad}
            >
              <i className="bi bi-arrow-counterclockwise me-1" aria-hidden="true"></i>
              Restablecer valores
            </button>
          </div>
        </aside>
      )}

      {/* 3. Asistente Curatorial "Prisma IA" (punto 3A.j) */}
      <button
        type="button"
        className="floating-ia-btn no-print"
        onClick={() => setAbrirIA(!abrirIA)}
        aria-expanded={abrirIA}
        aria-controls="panel-prisma-ia"
        aria-label="Abrir asistente curatorial Prisma IA"
      >
        <i className="bi bi-stars text-warning me-1" aria-hidden="true"></i>
        Prisma IA
      </button>

      {abrirIA && (
        <aside
          id="panel-prisma-ia"
          className="floating-ia-panel no-print"
          aria-label="Chat del asistente de inteligencia artificial Prisma IA"
        >
          <div className="bg-dark text-white p-3 d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h6 mb-0 text-warning">
                <i className="bi bi-stars me-1" aria-hidden="true"></i>
                Asistente Curatorial Prisma IA
              </h2>
              <span className="small text-light opacity-75">
                Aviso: Asistente automatizado de IA conectado al catálogo real
              </span>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar asistente Prisma IA"
              onClick={() => setAbrirIA(false)}
            ></button>
          </div>

          <div
            className="p-3 bg-soft flex-grow-1"
            style={{ overflowY: "auto", maxHeight: "320px" }}
          >
            {mensajesIA.map((m, idx) => (
              <div
                key={idx}
                className={`mb-3 d-flex flex-column ${
                  m.autor === "usuario" ? "align-items-end" : "align-items-start"
                }`}
              >
                <div
                  className={`p-2 rounded-3 small ${
                    m.autor === "usuario"
                      ? "bg-dark text-white"
                      : "bg-white border text-dark shadow-sm"
                  }`}
                  style={{ maxWidth: "90%", whiteSpace: "pre-line" }}
                >
                  {m.texto}
                </div>

                {m.obras && m.obras.length > 0 && (
                  <div className="mt-2 w-100 d-flex flex-column gap-1">
                    {m.obras.map((o) => (
                      <Link
                        key={o.id}
                        to={`/obras/detalle/${o.slug}`}
                        className="d-flex align-items-center gap-2 p-2 bg-white border rounded text-decoration-none text-dark small shadow-sm"
                        onClick={() => setAbrirIA(false)}
                      >
                        <img
                          src={o.imagenUrl}
                          alt={o.titulo}
                          width="42"
                          height="42"
                          className="rounded object-fit-cover"
                        />
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{o.titulo}</div>
                          <div className="text-gold fw-bold">{formatearMonedaCOP(o.precio)}</div>
                        </div>
                        <i className="bi bi-arrow-right-circle text-gold" aria-hidden="true"></i>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {cargandoIA && (
              <div className="small text-muted">Prisma IA está analizando el catálogo...</div>
            )}
          </div>

          <div className="px-3 py-2 bg-white border-top">
            <div className="d-flex flex-wrap gap-1 mb-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm py-0 small"
                onClick={() => enviarConsultaIA("Busco pintura al óleo para sala principal")}
              >
                Óleo para sala
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm py-0 small"
                onClick={() => enviarConsultaIA("Obras económicas de menos de 2 millones")}
              >
                Menos de $2M
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm py-0 small"
                onClick={() => enviarConsultaIA("Recomiéndame una escultura")}
              >
                Esculturas
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviarConsultaIA();
              }}
              className="input-group input-group-sm"
            >
              <label htmlFor="input-prisma-ia" className="visually-hidden">
                Escribe tu consulta para Prisma IA
              </label>
              <input
                id="input-prisma-ia"
                type="text"
                className="form-control"
                placeholder="Ej. Busco fotografía para estudio..."
                value={consultaIA}
                onChange={(e) => setConsultaIA(e.target.value)}
              />
              <button type="submit" className="btn btn-gold" disabled={cargandoIA}>
                Enviar
              </button>
            </form>
          </div>
        </aside>
      )}

      {/* 4. Botón flotante de WhatsApp (punto 3A.g) */}
      <a
        href={EMPRESA.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp no-print"
        aria-label="Contactar a Galería Prismas por WhatsApp"
        title="Asesoría por WhatsApp"
      >
        <i className="bi bi-whatsapp" aria-hidden="true"></i>
      </a>

      {/* 5. Banner de Cookies y Tratamiento de Datos Personales (punto 3A.n) */}
      {!cookiesAceptadas && (
        <div
          className="position-fixed bottom-0 start-0 end-0 bg-dark text-white p-3 shadow-lg border-top border-warning no-print"
          style={{ zIndex: 1090 }}
          role="region"
          aria-label="Aviso de cookies y privacidad"
        >
          <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
            <p className="mb-0 small">
              <i className="bi bi-shield-check text-warning me-2" aria-hidden="true"></i>
              Utilizamos almacenamiento local y cookies técnicas para conservar tu carrito, favoritos y preferencias de accesibilidad según la{" "}
              <Link to="/politica-de-datos" className="text-warning fw-semibold">
                Política de Tratamiento de Datos Personales (Ley 1581 de 2012)
              </Link>
              .
            </p>
            <button type="button" className="btn btn-gold btn-sm" onClick={aceptarCookies}>
              Entendido y aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingWidgets;
