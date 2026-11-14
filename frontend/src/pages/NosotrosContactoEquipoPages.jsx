import React, { useState } from "react";
import { Link } from "react-router-dom";
import { EMPRESA } from "../config/empresa";
import Breadcrumbs from "../components/common/Breadcrumbs";
import CrudApp from "../components/crud/CrudApp";
import {
  REGEX_CELULAR_CO,
  REGEX_CORREO,
  validarCelularColombiano,
  validarCorreo,
} from "../utils/validadores";

/**
 * Página Nosotros (/nosotros)
 * Cumple los puntos 3A.h y 3A.m:
 * - Acordeón empresarial con Bootstrap Accordion (Misión, Visión, Objetivos, Valores e Historia)
 * - Ubicación con iframe embebido de Google Maps con title descriptivo + dirección y horarios en texto
 */
export const NosotrosPage = () => {
  const [abierto, setAbierto] = useState("mision");

  const itemsAcordeon = [
    {
      id: "mision",
      titulo: "1. Misión Institucional",
      contenido:
        "Acercar el arte contemporáneo colombiano a compradores casuales, coleccionistas y estudiantes mediante una plataforma digital transparente, accesible y curada, que integra la exhibición de obras certificadas, la agenda de exposiciones y la formación artística práctica.",
    },
    {
      id: "vision",
      titulo: "2. Visión 2030",
      contenido:
        "Consolidarnos para el año 2030 como la galería y escuela de artes plásticas referente en Colombia por su excelencia curatorial, cumplimiento de estándares internacionales de accesibilidad web (WCAG 2.1 AA) e impulso al talento emergente y consolidado.",
    },
    {
      id: "objetivos",
      titulo: "3. Objetivos Estratégicos",
      contenido:
        "1) Garantizar precios transparentes y certificados de autenticidad en cada obra publicada. 2) Facilitar la inscripción a talleres artísticos con información clara de materiales, niveles y horarios. 3) Promover espacios gratuitos de circulación cultural mediante reservas digitales ágiles.",
    },
    {
      id: "valores",
      titulo: "4. Valores Corporativos",
      contenido:
        "Transparencia en la tasación artística · Respeto por los derechos de autor y comercio justo con los artistas · Inclusión y accesibilidad universal · Rigor pedagógico en nuestros talleres.",
    },
    {
      id: "historia",
      titulo: "5. Nuestra Historia",
      contenido:
        "Nacida en Bogotá a partir de una investigación de experiencia de usuario con coleccionistas y estudiantes universitarios, Galería Prismas surgió para eliminar la desorientación al comprar arte o inscribirse a cursos, unificando tres mundos (galería, museo y academia) bajo una arquitectura de información clara.",
    },
  ];

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Nosotros y Ubicación" }]} />

      <div className="row g-5 mb-5">
        <div className="col-lg-6">
          <span className="text-gold fw-bold text-uppercase small">Identidad Corporativa</span>
          <h1 className="h2 mb-3">Sobre Galería Prismas</h1>
          <p className="text-muted">
            Somos un espacio cultural y comercial en Bogotá que conecta a artistas plásticos con nuevos coleccionistas y estudiantes de arte.
          </p>

          {/* Acordeón empresarial de Bootstrap (punto 3A.m) */}
          <div className="accordion shadow-sm" id="acordeonEmpresarial">
            {itemsAcordeon.map((item) => {
              const expandido = abierto === item.id;
              return (
                <div className="accordion-item" key={item.id}>
                  <h2 className="accordion-header" id={`heading-${item.id}`}>
                    <button
                      className={`accordion-button fw-semibold ${expandido ? "" : "collapsed"}`}
                      type="button"
                      aria-expanded={expandido}
                      aria-controls={`collapse-${item.id}`}
                      onClick={() => setAbierto(expandido ? "" : item.id)}
                    >
                      {item.titulo}
                    </button>
                  </h2>
                  <div
                    id={`collapse-${item.id}`}
                    className={`accordion-collapse collapse ${expandido ? "show" : ""}`}
                    aria-labelledby={`heading-${item.id}`}
                  >
                    <div className="accordion-body small">{item.contenido}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mapa y Ubicación (punto 3A.h) */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 p-4 bg-soft h-100">
            <h2 className="h4 mb-3">
              <i className="bi bi-geo-alt-fill text-gold me-2" aria-hidden="true"></i>
              Ubicación y Horarios de Atención
            </h2>
            <p className="small mb-2">
              <strong>Dirección sede demostrativa:</strong> {EMPRESA.direccion}
            </p>
            <p className="small mb-3">
              <strong>Horario:</strong> {EMPRESA.horario}
            </p>

            <div className="ratio ratio-16x9 rounded overflow-hidden border shadow-sm mb-3">
              <iframe
                src={EMPRESA.googleMapsEmbedUrl}
                title="Mapa de ubicación de Galería Prismas en Universidad Libre Sede Bosque Popular, Bogotá"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <Link to="/contacto" className="btn btn-gold btn-sm">
                Ir a formulario de contacto
              </Link>
              <Link to="/equipo" className="btn btn-outline-dark btn-sm">
                Conocer al equipo desarrollador
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Página Contacto (/contacto)
 */
export const ContactoPage = () => {
  const [enviado, setEnviado] = useState(false);

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Contacto y Ubicación" }]} />

      <h1 className="h2 mb-3">Contacto y Canales de Atención</h1>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 p-4 bg-soft h-100">
            <h2 className="h5 mb-3">Información Directa</h2>
            <p className="small mb-2">
              <i className="bi bi-geo-alt-fill text-gold me-2" aria-hidden="true"></i>
              <strong>Dirección:</strong> {EMPRESA.direccion}
            </p>
            <p className="small mb-2">
              <i className="bi bi-clock-fill text-gold me-2" aria-hidden="true"></i>
              <strong>Horarios:</strong> {EMPRESA.horario}
            </p>
            <p className="small mb-2">
              <i className="bi bi-envelope-fill text-gold me-2" aria-hidden="true"></i>
              <strong>Correo:</strong> {EMPRESA.correoContacto}
            </p>
            <p className="small mb-4">
              <i className="bi bi-telephone-fill text-gold me-2" aria-hidden="true"></i>
              <strong>Teléfono:</strong> {EMPRESA.telefono}
            </p>

            <div className="ratio ratio-4x3 rounded overflow-hidden border">
              <iframe
                src={EMPRESA.googleMapsEmbedUrl}
                title="Ubicación geográfica de Galería Prismas en Bogotá"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="h5 mb-2">Escríbenos un Mensaje Rápido</h2>
            <p className="small text-muted mb-3">
              ¿Necesitas radicar una Petición, Queja, Reclamo o Sugerencia formal con número de seguimiento?{" "}
              <Link to="/pqr" className="text-gold fw-semibold">
                Usa nuestro Sistema Oficial de PQR aquí →
              </Link>
            </p>

            {enviado ? (
              <div className="alert alert-success">
                ¡Gracias por escribirnos! Nuestro equipo curatorial responderá a tu correo en menos de 24 horas hábiles.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEnviado(true);
                }}
              >
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="cnt-nombre" className="form-label small fw-semibold">
                      Nombre completo *
                    </label>
                    <input id="cnt-nombre" type="text" className="form-control" required />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="cnt-correo" className="form-label small fw-semibold">
                      Correo electrónico *
                    </label>
                    <input id="cnt-correo" type="email" className="form-control" required />
                  </div>
                  <div className="col-12">
                    <label htmlFor="cnt-msg" className="form-label small fw-semibold">
                      Consulta *
                    </label>
                    <textarea id="cnt-msg" rows="4" className="form-control" required></textarea>
                  </div>
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        id="cnt-datos"
                        type="checkbox"
                        className="form-check-input"
                        required
                      />
                      <label htmlFor="cnt-datos" className="form-check-label small">
                        Acepto la{" "}
                        <Link to="/politica-de-datos" className="text-gold">
                          Política de Tratamiento de Datos Personales (Ley 1581 de 2012)
                        </Link>{" "}
                        *
                      </label>
                    </div>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-gold">
                      Enviar mensaje
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Página Equipo de Desarrolladores (/equipo)
 * Cumple el punto 3A.l:
 * - Consume api-virtual (json-server en http://localhost:5000/desarrolladores) con helpFetch.
 * - Muestra tarjetas con foto o avatar con iniciales, nombre, rol por sprint, celular, correo, GitHub y LinkedIn.
 * - Incluye CRUD completo (crear, editar, eliminar) reutilizando CrudApp del Lab IV con validación de celular y correo por regex.
 */
const ROLES_SPRINT = [
  {
    sprint: "Sprint 1",
    po: "Sara Cárdenas",
    sm: "Nicolás Molina",
    dev: "Brayan Gómez",
  },
  {
    sprint: "Sprint 2",
    po: "Brayan Gómez",
    sm: "Sara Cárdenas",
    dev: "Nicolás Molina",
  },
  {
    sprint: "Sprint 3",
    po: "Nicolás Molina",
    sm: "Brayan Gómez",
    dev: "Sara Cárdenas",
  },
  {
    sprint: "Sprint 4",
    po: "Sara Cárdenas",
    sm: "Nicolás Molina",
    dev: "Brayan Gómez",
  },
];

function obtenerIniciales(nombre = "") {
  return String(nombre)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export const EquipoPage = () => {
  const [imgFallidas, setImgFallidas] = useState({});

  const fieldsEquipo = [
    {
      name: "nombre",
      label: "Nombre completo",
      required: true,
      placeholder: "Ej. Sara Cárdenas",
      colClass: "col-md-4",
    },
    {
      name: "rol",
      label: "Rol en el Sprint actual",
      type: "select",
      required: true,
      colClass: "col-md-4",
      options: [
        { value: "Product Owner", label: "Product Owner" },
        { value: "Scrum Master", label: "Scrum Master" },
        { value: "Developer", label: "Developer" },
      ],
    },
    {
      name: "celular",
      label: "Celular colombiano (10 dígitos)",
      required: true,
      pattern: REGEX_CELULAR_CO.source,
      errorMsg: "El celular debe tener 10 dígitos e iniciar en 3 (ej. 3000000001).",
      placeholder: "3000000001",
      colClass: "col-md-4",
    },
    {
      name: "correo",
      label: "Correo electrónico institucional o personal",
      type: "email",
      required: true,
      pattern: REGEX_CORREO.source,
      errorMsg: "Introduce un correo electrónico válido.",
      placeholder: "sara-cardenasc@unilibre.edu.co",
      colClass: "col-md-4",
    },
    {
      name: "github",
      label: "URL de GitHub",
      placeholder: "https://github.com/SCCUBILLOS",
      colClass: "col-md-4",
    },
    {
      name: "linkedin",
      label: "URL de LinkedIn",
      placeholder: "https://www.linkedin.com/",
      colClass: "col-md-4",
    },
    {
      name: "foto",
      label: "Ruta de foto (opcional)",
      placeholder: "/equipo/sara.jpg",
      colClass: "col-md-4",
    },
    {
      name: "biografia",
      label: "Perfil / Responsabilidades en el proyecto",
      type: "textarea",
      rows: 2,
      colClass: "col-md-8",
    },
  ];

  const columnsEquipo = [
    {
      key: "nombre",
      label: "Integrante",
      render: (val, row) => (
        <div className="d-flex align-items-center gap-2">
          {row.foto && !imgFallidas[row.id] ? (
            <img
              src={row.foto}
              alt={val}
              width="42"
              height="42"
              className="rounded-circle object-fit-cover"
              onError={() => setImgFallidas((prev) => ({ ...prev, [row.id]: true }))}
            />
          ) : (
            <div
              className="rounded-circle bg-dark text-warning fw-bold d-inline-flex align-items-center justify-content-center"
              style={{ width: "42px", height: "42px" }}
              aria-label={`Avatar con iniciales de ${val}`}
            >
              {obtenerIniciales(val)}
            </div>
          )}
          <div>
            <div className="fw-bold">{val}</div>
            <div className="small text-muted">{row.biografia}</div>
          </div>
        </div>
      ),
    },
    {
      key: "rol",
      label: "Rol Sprint 1",
      render: (val) => <span className="badge bg-dark">{val}</span>,
    },
    { key: "correo", label: "Correo" },
    { key: "celular", label: "Celular" },
    {
      key: "github",
      label: "Enlaces",
      render: (_val, row) => (
        <div className="d-flex gap-2">
          {row.github ? (
            <a
              href={row.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-dark btn-sm"
            >
              <i className="bi bi-github me-1" aria-hidden="true"></i>
              GitHub
            </a>
          ) : (
            <span className="small text-muted">Sin GitHub</span>
          )}
          {row.linkedin && (
            <a
              href={row.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm"
            >
              <i className="bi bi-linkedin" aria-hidden="true"></i>
            </a>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Equipo de Desarrolladores (API Virtual)" }]} />

      <div className="mb-4">
        <span className="text-gold fw-bold text-uppercase small">
          Laboratorio IV Reutilizado · json-server (Puerto 5000)
        </span>
        <h1 className="h2 mb-1">Equipo de Desarrollo — Metodología Scrum</h1>
        <p className="text-muted small mb-0">
          Los perfiles de los desarrolladores se consumen en vivo desde la API virtual (<code>http://localhost:5000/desarrolladores</code>) mediante <code>helpFetch.js</code> y permiten crear, editar o eliminar registros con validación regex de celular y correo.
        </p>
      </div>

      {/* Tabla de rotación de roles por Sprint (sección 7) */}
      <section className="card border-0 shadow-sm p-4 bg-soft mb-4" aria-label="Rotación de roles Scrum">
        <h2 className="h5 mb-3">
          <i className="bi bi-kanban text-gold me-2" aria-hidden="true"></i>
          Rotación Oficial de Roles Scrum (4 Sprints)
        </h2>
        <div className="table-responsive">
          <table className="table table-sm table-bordered bg-white mb-0">
            <thead className="table-dark">
              <tr>
                <th scope="col">Sprint</th>
                <th scope="col">Product Owner</th>
                <th scope="col">Scrum Master</th>
                <th scope="col">Developer</th>
              </tr>
            </thead>
            <tbody>
              {ROLES_SPRINT.map((r) => (
                <tr key={r.sprint}>
                  <td className="fw-bold">{r.sprint}</td>
                  <td>{r.po}</td>
                  <td>{r.sm}</td>
                  <td>{r.dev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CRUD completo conectado a json-server */}
      <CrudApp
        title="Perfiles de Desarrolladores (API Virtual json-server)"
        endpoint={EMPRESA.apiVirtualUrl}
        fields={fieldsEquipo}
        columns={columnsEquipo}
        initialForm={{
          id: null,
          nombre: "",
          rol: "Developer",
          celular: "",
          correo: "",
          github: "",
          linkedin: "",
          foto: "",
          biografia: "",
        }}
        customValidate={(form) => {
          const errs = {};
          if (!validarCelularColombiano(form.celular)) {
            errs.celular = "El celular debe cumplir la regex ^3\\d{9}$ (10 dígitos comenzando en 3).";
          }
          if (!validarCorreo(form.correo)) {
            errs.correo = "El correo electrónico no tiene un formato válido.";
          }
          return errs;
        }}
      />
    </div>
  );
};
