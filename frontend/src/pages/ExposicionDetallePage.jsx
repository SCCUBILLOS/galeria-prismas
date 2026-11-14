import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
 * Detalle de Exposición y Reserva de Entradas (/exposiciones/:id)
 * Flujo 1.4: Inicio → Exposiciones → Próximas → Seleccionar evento → Fecha/hora → Confirmar entradas.
 */
const ExposicionDetallePage = () => {
  const { id } = useParams();
  const [exposicion, setExposicion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  const [errores, setErrores] = useState({});

  const [form, setForm] = useState({
    nombreAsistente: "",
    documento: "",
    correo: "",
    celular: "",
    fechaVisita: "2026-11-28",
    horaVisita: "11:00 a. m.",
    cantidadEntradas: 2,
    aceptaDatos: false,
  });

  useEffect(() => {
    setCargando(true);
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/exposiciones/${id}`)
      .then((res) => {
        if (!res.err && res.exposicion) {
          setExposicion(res.exposicion);
          setForm((prev) => ({
            ...prev,
            fechaVisita: res.exposicion.fechaInicio || "2026-11-28",
          }));
        }
        setCargando(false);
      });
  }, [id]);

  const validarFormulario = () => {
    const err = {};
    if (!validarNombre(form.nombreAsistente)) {
      err.nombreAsistente = "Ingresa tu nombre completo usando solo letras y espacios.";
    }
    if (!validarDocumento(form.documento)) {
      err.documento = "El documento debe contener entre 6 y 10 dígitos numéricos.";
    }
    if (!validarCorreo(form.correo)) {
      err.correo = "Introduce un correo electrónico válido.";
    }
    if (!validarCelularColombiano(form.celular)) {
      err.celular = "El celular debe ser colombiano de 10 dígitos e iniciar en 3 (ej. 3001234567).";
    }
    if (!form.fechaVisita) {
      err.fechaVisita = "Selecciona una fecha de visita.";
    }
    if (!form.aceptaDatos) {
      err.aceptaDatos = "Debes aceptar la política de tratamiento de datos personales.";
    }
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setEnviando(true);
    helpFetch()
      .post(`${EMPRESA.apiBaseUrl}/exposiciones/${exposicion.id}/reservar`, {
        body: form,
      })
      .then((res) => {
        if (!res.err && res.reserva) {
          setConfirmacion(res.reserva);
          setExposicion((prev) => ({
            ...prev,
            cuposDisponibles: prev.cuposDisponibles - Number(form.cantidadEntradas),
          }));
        } else {
          setErrores({ general: res.statusText || "No se pudo procesar la reserva." });
        }
        setEnviando(false);
      });
  };

  if (cargando) {
    return (
      <div className="container py-5">
        <Loader texto="Cargando información de la exposición..." />
      </div>
    );
  }

  if (!exposicion) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h3">Exposición no encontrada</h1>
        <Link to="/exposiciones" className="btn btn-gold mt-3">
          Volver a exposiciones
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Breadcrumbs
        items={[
          { label: "Exposiciones", to: "/exposiciones" },
          { label: exposicion.titulo },
        ]}
      />

      <div className="row g-5">
        <div className="col-lg-7">
          <img
            src={exposicion.imagenUrl}
            alt={`Exposición ${exposicion.titulo}`}
            className="img-fluid rounded-3 shadow-sm mb-4 w-100"
            style={{ maxHeight: "420px", objectFit: "cover" }}
          />
          <span className="badge bg-dark mb-2">{exposicion.estado}</span>
          <h1 className="h2 mb-2">{exposicion.titulo}</h1>
          <p className="lead text-gold fw-semibold">{exposicion.subtitulo}</p>
          <p>{exposicion.descripcion}</p>

          <div className="p-3 bg-soft rounded border mt-4">
            <h2 className="h5 mb-3">Ficha de la Exposición</h2>
            <dl className="row small mb-0">
              <dt className="col-sm-4 text-muted">Curaduría:</dt>
              <dd className="col-sm-8 fw-semibold">{exposicion.curador}</dd>

              <dt className="col-sm-4 text-muted">Fechas:</dt>
              <dd className="col-sm-8">
                {formatearFechaES(exposicion.fechaInicio)} al{" "}
                {formatearFechaES(exposicion.fechaFin)}
              </dd>

              <dt className="col-sm-4 text-muted">Horario de visita:</dt>
              <dd className="col-sm-8">{exposicion.horario}</dd>

              <dt className="col-sm-4 text-muted">Sala:</dt>
              <dd className="col-sm-8">{exposicion.sala}</dd>

              <dt className="col-sm-4 text-muted">Valor de entrada:</dt>
              <dd className="col-sm-8 fw-bold">
                {exposicion.precioEntrada === 0
                  ? "Entrada libre con reserva previa"
                  : formatearMonedaCOP(exposicion.precioEntrada)}
              </dd>

              <dt className="col-sm-4 text-muted mb-0">Cupos disponibles:</dt>
              <dd className="col-sm-8 mb-0">
                {exposicion.cuposDisponibles} de {exposicion.cupoMaximo} asistentes
              </dd>
            </dl>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card shadow-sm border-0 p-4 sticky-lg-top" style={{ top: "5.5rem" }}>
            <h2 className="h4 mb-3">
              <i className="bi bi-ticket-perforated text-gold me-2" aria-hidden="true"></i>
              Reserva de Entradas
            </h2>

            {confirmacion ? (
              <div className="alert alert-success" role="status">
                <h3 className="h5 fw-bold">¡Reserva Confirmada!</h3>
                <p className="small mb-2">
                  Código de reserva: <strong>{confirmacion.codigoReserva}</strong>
                </p>
                <ul className="small mb-3">
                  <li>
                    <strong>Asistente:</strong> {confirmacion.nombreAsistente}
                  </li>
                  <li>
                    <strong>Fecha y hora:</strong> {confirmacion.fechaVisita} a las{" "}
                    {confirmacion.horaVisita}
                  </li>
                  <li>
                    <strong>Entradas:</strong> {confirmacion.cantidadEntradas}
                  </li>
                </ul>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  onClick={() => setConfirmacion(null)}
                >
                  Realizar otra reserva
                </button>
              </div>
            ) : exposicion.estado === "Finalizado" ? (
              <div className="alert alert-secondary">
                Esta muestra ya finalizó. Puedes explorar nuestras exposiciones activas o próximas en la agenda.
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {errores.general && (
                  <div className="alert alert-danger small">{errores.general}</div>
                )}

                <div className="mb-3">
                  <label htmlFor="res-nombre" className="form-label small fw-semibold">
                    Nombre completo *
                  </label>
                  <input
                    id="res-nombre"
                    type="text"
                    className={`form-control ${errores.nombreAsistente ? "is-invalid" : ""}`}
                    placeholder="Ej. Carlos Andrés Mendoza"
                    value={form.nombreAsistente}
                    onChange={(e) =>
                      setForm({ ...form, nombreAsistente: e.target.value })
                    }
                    required
                  />
                  {errores.nombreAsistente && (
                    <div className="invalid-feedback">{errores.nombreAsistente}</div>
                  )}
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="res-doc" className="form-label small fw-semibold">
                      Documento (6-10 dígitos) *
                    </label>
                    <input
                      id="res-doc"
                      type="text"
                      className={`form-control ${errores.documento ? "is-invalid" : ""}`}
                      placeholder="1020765432"
                      value={form.documento}
                      onChange={(e) => setForm({ ...form, documento: e.target.value })}
                      required
                    />
                    {errores.documento && (
                      <div className="invalid-feedback">{errores.documento}</div>
                    )}
                  </div>

                  <div className="col-sm-6">
                    <label htmlFor="res-cel" className="form-label small fw-semibold">
                      Celular colombiano *
                    </label>
                    <input
                      id="res-cel"
                      type="tel"
                      className={`form-control ${errores.celular ? "is-invalid" : ""}`}
                      placeholder="3001234567"
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
                  <label htmlFor="res-correo" className="form-label small fw-semibold">
                    Correo electrónico *
                  </label>
                  <input
                    id="res-correo"
                    type="email"
                    className={`form-control ${errores.correo ? "is-invalid" : ""}`}
                    placeholder="visitante@correo.co"
                    value={form.correo}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                    required
                  />
                  {errores.correo && (
                    <div className="invalid-feedback">{errores.correo}</div>
                  )}
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="res-fecha" className="form-label small fw-semibold">
                      Fecha de visita *
                    </label>
                    <input
                      id="res-fecha"
                      type="date"
                      className={`form-control ${errores.fechaVisita ? "is-invalid" : ""}`}
                      value={form.fechaVisita}
                      onChange={(e) => setForm({ ...form, fechaVisita: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="res-hora" className="form-label small fw-semibold">
                      Franja horaria *
                    </label>
                    <select
                      id="res-hora"
                      className="form-select"
                      value={form.horaVisita}
                      onChange={(e) => setForm({ ...form, horaVisita: e.target.value })}
                    >
                      <option value="10:30 a. m.">10:30 a. m.</option>
                      <option value="11:00 a. m.">11:00 a. m.</option>
                      <option value="3:00 p. m.">3:00 p. m. (Recorrido curatorial)</option>
                      <option value="5:00 p. m.">5:00 p. m.</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="res-cantidad" className="form-label small fw-semibold">
                    Número de entradas (máximo 10)
                  </label>
                  <input
                    id="res-cantidad"
                    type="number"
                    min="1"
                    max="10"
                    className="form-control"
                    value={form.cantidadEntradas}
                    onChange={(e) =>
                      setForm({ ...form, cantidadEntradas: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="form-check mb-3">
                  <input
                    id="res-datos"
                    type="checkbox"
                    className={`form-check-input ${errores.aceptaDatos ? "is-invalid" : ""}`}
                    checked={form.aceptaDatos}
                    onChange={(e) => setForm({ ...form, aceptaDatos: e.target.checked })}
                  />
                  <label htmlFor="res-datos" className="form-check-label small">
                    Acepto el tratamiento de mis datos personales conforme a la{" "}
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
                  disabled={enviando}
                >
                  {enviando ? "Confirmando reserva..." : "Confirmar reserva de entradas"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExposicionDetallePage;
