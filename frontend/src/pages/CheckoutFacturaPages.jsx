import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { EMPRESA, formatearMonedaCOP, formatearFechaES } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import {
  validarNombre,
  validarDocumento,
  validarCorreo,
  validarCelularColombiano,
  validarLuhn,
  validarFechaVencimientoFutura,
  validarCVV,
} from "../utils/validadores";
import Breadcrumbs from "../components/common/Breadcrumbs";
import Loader from "../components/crud/Loader";

/**
 * Checkout y Pasarela de Pago Ficticia en 3 pasos (/checkout)
 * Cumple el punto 3A.s y las Heurísticas #1, #3, #5, #9, #10:
 * - Paso 1: Datos del comprador
 * - Paso 2: Dirección de envío asegurado
 * - Paso 3: Método de pago (Tarjeta con validación Luhn y 3 tarjetas de prueba rápidas, PSE y Nequi)
 * - Aviso visible: "Pasarela de demostración, no se procesan pagos reales"
 */
export const CheckoutPage = () => {
  const {
    carrito,
    subtotalCarrito,
    ivaCarrito,
    totalCarrito,
    vaciarCarrito,
    mostrarToast,
  } = useApp();
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [errores, setErrores] = useState({});

  const [datos, setDatos] = useState({
    nombreCliente: "",
    documentoCliente: "",
    correoCliente: "",
    celularCliente: "",
    direccionEnvio: "",
    ciudadEnvio: "Bogotá",
    notasEnvio: "",
    metodoPago: "TARJETA",
    numeroTarjeta: "",
    titularTarjeta: "",
    vencimiento: "12/28",
    cvv: "345",
    bancoPse: "Bancolombia",
    celularNequi: "",
    aceptaDatos: false,
  });

  // Botones de autocompletado de tarjetas de prueba documentadas en el README y rúbrica 3A.s
  const cargarTarjetaPrueba = (tipo) => {
    if (tipo === "APROBADA") {
      setDatos((prev) => ({
        ...prev,
        metodoPago: "TARJETA",
        numeroTarjeta: "4242424242424242",
        titularTarjeta: prev.nombreCliente || "CARLOS MENDOZA",
        vencimiento: "12/29",
        cvv: "842",
      }));
    } else if (tipo === "RECHAZADA") {
      setDatos((prev) => ({
        ...prev,
        metodoPago: "TARJETA",
        numeroTarjeta: "4000000000000002",
        titularTarjeta: prev.nombreCliente || "CARLOS MENDOZA",
        vencimiento: "12/29",
        cvv: "123",
      }));
    } else if (tipo === "FONDOS") {
      setDatos((prev) => ({
        ...prev,
        metodoPago: "TARJETA",
        numeroTarjeta: "4111111111111111",
        titularTarjeta: prev.nombreCliente || "CARLOS MENDOZA",
        vencimiento: "12/29",
        cvv: "999",
      }));
    }
    setErrores({});
  };

  const validarPaso1 = () => {
    const err = {};
    if (!validarNombre(datos.nombreCliente)) {
      err.nombreCliente = "El nombre solo debe contener letras y espacios (mínimo 3 caracteres).";
    }
    if (!validarDocumento(datos.documentoCliente)) {
      err.documentoCliente = "El documento debe tener entre 6 y 10 dígitos numéricos.";
    }
    if (!validarCorreo(datos.correoCliente)) {
      err.correoCliente = "Introduce un correo electrónico válido.";
    }
    if (!validarCelularColombiano(datos.celularCliente)) {
      err.celularCliente = "El celular debe ser colombiano de 10 dígitos e iniciar en 3 (ej. 3154829103).";
    }
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const validarPaso2 = () => {
    const err = {};
    if (datos.direccionEnvio.trim().length < 5) {
      err.direccionEnvio = "Ingresa una dirección de entrega válida (mínimo 5 caracteres).";
    }
    if (!datos.ciudadEnvio.trim()) {
      err.ciudadEnvio = "Selecciona o escribe la ciudad de destino.";
    }
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const validarPaso3 = () => {
    const err = {};
    if (datos.metodoPago === "TARJETA") {
      if (!validarLuhn(datos.numeroTarjeta)) {
        err.numeroTarjeta =
          "Número de tarjeta inválido según el algoritmo de Luhn. Usa una de las tarjetas de prueba.";
      }
      if (!validarFechaVencimientoFutura(datos.vencimiento)) {
        err.vencimiento = "La fecha de vencimiento debe ser futura en formato MM/AA (ej. 12/29).";
      }
      if (!validarCVV(datos.cvv)) {
        err.cvv = "El código CVV debe tener 3 o 4 dígitos numéricos.";
      }
    } else if (datos.metodoPago === "PSE") {
      if (!datos.bancoPse) {
        err.bancoPse = "Selecciona tu banco para el débito PSE.";
      }
    } else if (datos.metodoPago === "NEQUI") {
      if (!validarCelularColombiano(datos.celularNequi || datos.celularCliente)) {
        err.celularNequi = "Ingresa un número celular Nequi colombiano de 10 dígitos.";
      }
    }

    if (!datos.aceptaDatos) {
      err.aceptaDatos =
        "Debes aceptar la Política de Tratamiento de Datos Personales (Ley 1581 de 2012).";
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const avanzarPaso = () => {
    if (paso === 1 && validarPaso1()) setPaso(2);
    else if (paso === 2 && validarPaso2()) setPaso(3);
  };

  const handleConfirmarPago = (e) => {
    e.preventDefault();
    if (!validarPaso1()) {
      setPaso(1);
      return;
    }
    if (!validarPaso2()) {
      setPaso(2);
      return;
    }
    if (!validarPaso3()) return;

    setProcesando(true);
    const payload = {
      nombreCliente: datos.nombreCliente,
      documentoCliente: datos.documentoCliente,
      correoCliente: datos.correoCliente,
      celularCliente: datos.celularCliente,
      direccionEnvio: datos.direccionEnvio,
      ciudadEnvio: datos.ciudadEnvio,
      notasEnvio: datos.notasEnvio,
      metodoPago: datos.metodoPago,
      aceptaDatos: datos.aceptaDatos,
      datosPago: {
        numeroTarjeta: datos.numeroTarjeta,
        vencimiento: datos.vencimiento,
        cvv: datos.cvv,
        banco: datos.bancoPse,
        celularNequi: datos.celularNequi || datos.celularCliente,
      },
      items: carrito.map((i) => ({
        obraId: i.id,
        cantidad: i.cantidad,
      })),
    };

    helpFetch()
      .post(`${EMPRESA.apiBaseUrl}/checkout`, { body: payload })
      .then((res) => {
        if (!res.err && res.pedido) {
          vaciarCarrito();
          mostrarToast(`Pago aprobado. Factura ${res.pedido.numeroFactura} emitida.`, "success");
          navigate(`/pedido/${res.pedido.id}/factura`);
        } else {
          setErrores({
            general:
              res.statusText ||
              "La transacción no pudo completarse. Revisa los datos del medio de pago.",
          });
        }
        setProcesando(false);
      });
  };

  if (carrito.length === 0) {
    return (
      <div className="container py-5 text-center">
        <Breadcrumbs items={[{ label: "Checkout" }]} />
        <h1 className="h3 mt-4">No tienes obras en el carrito para pagar</h1>
        <Link to="/obras" className="btn btn-gold mt-3">
          Explorar catálogo de obras
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Breadcrumbs
        items={[
          { label: "Carrito", to: "/carrito" },
          { label: "Checkout y Pasarela de Pago" },
        ]}
      />

      {/* Aviso obligatorio rúbrica 3A.s */}
      <div className="alert alert-warning d-flex align-items-center gap-2 shadow-sm mb-4" role="note">
        <i className="bi bi-shield-exclamation fs-4" aria-hidden="true"></i>
        <div>
          <strong>Pasarela de demostración, no se procesan pagos reales.</strong> Ambiente académico simulado para validación de inventario transaccional, algoritmo de Luhn y facturación electrónica.
        </div>
      </div>

      <h1 className="h2 mb-3">Finalizar Compra — Pasarela Galería Prismas</h1>

      {/* Barra de progreso del Checkout en 3 pasos (Heurística #1) */}
      <div className="mb-4" aria-label="Progreso del checkout">
        <div className="d-flex justify-content-between mb-2 small fw-bold">
          <span className={paso >= 1 ? "text-gold" : "text-muted"}>
            1. Datos del Comprador
          </span>
          <span className={paso >= 2 ? "text-gold" : "text-muted"}>
            2. Envío Asegurado
          </span>
          <span className={paso >= 3 ? "text-gold" : "text-muted"}>
            3. Pago y Confirmación
          </span>
        </div>
        <div className="progress" style={{ height: "10px" }}>
          <div
            className="progress-bar bg-warning"
            role="progressbar"
            style={{ width: `${(paso / 3) * 100}%` }}
            aria-valuenow={paso}
            aria-valuemin="1"
            aria-valuemax="3"
          ></div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 p-4">
            {errores.general && (
              <div className="alert alert-danger d-flex align-items-center gap-2" role="alert">
                <i className="bi bi-exclamation-octagon-fill" aria-hidden="true"></i>
                <span>{errores.general}</span>
              </div>
            )}

            <form onSubmit={handleConfirmarPago} noValidate>
              {/* PASO 1: DATOS PERSONALES */}
              {paso === 1 && (
                <section aria-label="Paso 1: Datos del comprador">
                  <h2 className="h4 mb-3">Paso 1: Datos para Facturación</h2>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="chk-nombre" className="form-label fw-semibold small">
                        Nombre completo *
                      </label>
                      <input
                        id="chk-nombre"
                        type="text"
                        className={`form-control ${errores.nombreCliente ? "is-invalid" : ""}`}
                        placeholder="Ej. Carlos Andrés Mendoza"
                        value={datos.nombreCliente}
                        onChange={(e) =>
                          setDatos({ ...datos, nombreCliente: e.target.value })
                        }
                      />
                      {errores.nombreCliente && (
                        <div className="invalid-feedback">{errores.nombreCliente}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="chk-doc" className="form-label fw-semibold small">
                        Cédula / Documento (6 a 10 dígitos) *
                      </label>
                      <input
                        id="chk-doc"
                        type="text"
                        className={`form-control ${errores.documentoCliente ? "is-invalid" : ""}`}
                        placeholder="1020765432"
                        value={datos.documentoCliente}
                        onChange={(e) =>
                          setDatos({ ...datos, documentoCliente: e.target.value })
                        }
                      />
                      {errores.documentoCliente && (
                        <div className="invalid-feedback">{errores.documentoCliente}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="chk-correo" className="form-label fw-semibold small">
                        Correo electrónico *
                      </label>
                      <input
                        id="chk-correo"
                        type="email"
                        className={`form-control ${errores.correoCliente ? "is-invalid" : ""}`}
                        placeholder="carlos@coleccionista.co"
                        value={datos.correoCliente}
                        onChange={(e) =>
                          setDatos({ ...datos, correoCliente: e.target.value })
                        }
                      />
                      {errores.correoCliente && (
                        <div className="invalid-feedback">{errores.correoCliente}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="chk-cel" className="form-label fw-semibold small">
                        Celular colombiano (10 dígitos, inicia en 3) *
                      </label>
                      <input
                        id="chk-cel"
                        type="tel"
                        className={`form-control ${errores.celularCliente ? "is-invalid" : ""}`}
                        placeholder="3154829103"
                        value={datos.celularCliente}
                        onChange={(e) =>
                          setDatos({ ...datos, celularCliente: e.target.value })
                        }
                      />
                      {errores.celularCliente && (
                        <div className="invalid-feedback">{errores.celularCliente}</div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <Link to="/carrito" className="btn btn-outline-secondary">
                      ← Volver al carrito
                    </Link>
                    <button
                      type="button"
                      className="btn btn-gold"
                      onClick={avanzarPaso}
                    >
                      Siguiente: Datos de envío →
                    </button>
                  </div>
                </section>
              )}

              {/* PASO 2: ENVÍO */}
              {paso === 2 && (
                <section aria-label="Paso 2: Dirección de envío">
                  <h2 className="h4 mb-3">Paso 2: Envío Museográfico Asegurado</h2>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label htmlFor="chk-dir" className="form-label fw-semibold small">
                        Dirección completa de entrega *
                      </label>
                      <input
                        id="chk-dir"
                        type="text"
                        className={`form-control ${errores.direccionEnvio ? "is-invalid" : ""}`}
                        placeholder="Ej. Carrera 11 # 84-42 Apto 502"
                        value={datos.direccionEnvio}
                        onChange={(e) =>
                          setDatos({ ...datos, direccionEnvio: e.target.value })
                        }
                      />
                      {errores.direccionEnvio && (
                        <div className="invalid-feedback">{errores.direccionEnvio}</div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="chk-ciudad" className="form-label fw-semibold small">
                        Ciudad *
                      </label>
                      <select
                        id="chk-ciudad"
                        className="form-select"
                        value={datos.ciudadEnvio}
                        onChange={(e) =>
                          setDatos({ ...datos, ciudadEnvio: e.target.value })
                        }
                      >
                        <option value="Bogotá">Bogotá D.C.</option>
                        <option value="Medellín">Medellín</option>
                        <option value="Cali">Cali</option>
                        <option value="Barranquilla">Barranquilla</option>
                        <option value="Bucaramanga">Bucaramanga</option>
                        <option value="Cartagena">Cartagena</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label htmlFor="chk-notas" className="form-label fw-semibold small">
                        Instrucciones especiales de entrega o marquetería (Opcional)
                      </label>
                      <textarea
                        id="chk-notas"
                        rows="2"
                        className="form-control"
                        placeholder="Ej. Entregar en recepción de lunes a viernes..."
                        value={datos.notasEnvio}
                        onChange={(e) =>
                          setDatos({ ...datos, notasEnvio: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setPaso(1)}
                    >
                      ← Paso anterior
                    </button>
                    <button
                      type="button"
                      className="btn btn-gold"
                      onClick={avanzarPaso}
                    >
                      Siguiente: Método de pago →
                    </button>
                  </div>
                </section>
              )}

              {/* PASO 3: MEDIO DE PAGO */}
              {paso === 3 && (
                <section aria-label="Paso 3: Selección de pago">
                  <h2 className="h4 mb-3">Paso 3: Medio de Pago</h2>

                  <div className="btn-group w-100 mb-4" role="group" aria-label="Elegir método de pago">
                    {["TARJETA", "PSE", "NEQUI"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`btn ${
                          datos.metodoPago === m ? "btn-dark" : "btn-outline-dark"
                        }`}
                        onClick={() => setDatos({ ...datos, metodoPago: m })}
                      >
                        {m === "TARJETA"
                          ? "Tarjeta Crédito / Débito"
                          : m === "PSE"
                          ? "PSE (Débito Bancario)"
                          : "Nequi"}
                      </button>
                    ))}
                  </div>

                  {datos.metodoPago === "TARJETA" && (
                    <div className="p-3 bg-soft rounded border mb-3">
                      <div className="mb-3">
                        <span className="small fw-bold d-block mb-2">
                          Tarjetas de prueba en 1 clic (para sustentación):
                        </span>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() => cargarTarjetaPrueba("APROBADA")}
                          >
                            Usar Tarjeta Aprobada (4242...4242)
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => cargarTarjetaPrueba("RECHAZADA")}
                          >
                            Usar Tarjeta Rechazada (...0000)
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-warning text-dark btn-sm"
                            onClick={() => cargarTarjetaPrueba("FONDOS")}
                          >
                            Usar Fondos Insuficientes (...1111)
                          </button>
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-12">
                          <label htmlFor="chk-tarjeta" className="form-label small fw-semibold">
                            Número de tarjeta (Validación algoritmo de Luhn) *
                          </label>
                          <input
                            id="chk-tarjeta"
                            type="text"
                            className={`form-control ${errores.numeroTarjeta ? "is-invalid" : ""}`}
                            placeholder="4242424242424242"
                            value={datos.numeroTarjeta}
                            onChange={(e) =>
                              setDatos({ ...datos, numeroTarjeta: e.target.value })
                            }
                          />
                          {errores.numeroTarjeta && (
                            <div className="invalid-feedback">{errores.numeroTarjeta}</div>
                          )}
                        </div>

                        <div className="col-sm-6">
                          <label htmlFor="chk-venc" className="form-label small fw-semibold">
                            Fecha de vencimiento (MM/AA futura) *
                          </label>
                          <input
                            id="chk-venc"
                            type="text"
                            className={`form-control ${errores.vencimiento ? "is-invalid" : ""}`}
                            placeholder="12/29"
                            value={datos.vencimiento}
                            onChange={(e) =>
                              setDatos({ ...datos, vencimiento: e.target.value })
                            }
                          />
                          {errores.vencimiento && (
                            <div className="invalid-feedback">{errores.vencimiento}</div>
                          )}
                        </div>

                        <div className="col-sm-6">
                          <label htmlFor="chk-cvv" className="form-label small fw-semibold">
                            Código CVV (3 o 4 dígitos) *
                          </label>
                          <input
                            id="chk-cvv"
                            type="text"
                            className={`form-control ${errores.cvv ? "is-invalid" : ""}`}
                            placeholder="842"
                            value={datos.cvv}
                            onChange={(e) =>
                              setDatos({ ...datos, cvv: e.target.value })
                            }
                          />
                          {errores.cvv && (
                            <div className="invalid-feedback">{errores.cvv}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {datos.metodoPago === "PSE" && (
                    <div className="p-3 bg-soft rounded border mb-3">
                      <label htmlFor="chk-banco" className="form-label small fw-semibold">
                        Selecciona tu entidad bancaria PSE *
                      </label>
                      <select
                        id="chk-banco"
                        className="form-select"
                        value={datos.bancoPse}
                        onChange={(e) =>
                          setDatos({ ...datos, bancoPse: e.target.value })
                        }
                      >
                        <option value="Bancolombia">Bancolombia (Simulación Aprobada)</option>
                        <option value="Banco de Bogotá">Banco de Bogotá (Simulación Aprobada)</option>
                        <option value="Davivienda">Davivienda (Simulación Aprobada)</option>
                        <option value="BANCO_RECHAZADO">Banco de Prueba Rechazado</option>
                      </select>
                    </div>
                  )}

                  {datos.metodoPago === "NEQUI" && (
                    <div className="p-3 bg-soft rounded border mb-3">
                      <label htmlFor="chk-nequi" className="form-label small fw-semibold">
                        Número celular de cuenta Nequi *
                      </label>
                      <input
                        id="chk-nequi"
                        type="tel"
                        className={`form-control ${errores.celularNequi ? "is-invalid" : ""}`}
                        placeholder={datos.celularCliente || "3154829103"}
                        value={datos.celularNequi}
                        onChange={(e) =>
                          setDatos({ ...datos, celularNequi: e.target.value })
                        }
                      />
                      {errores.celularNequi && (
                        <div className="invalid-feedback">{errores.celularNequi}</div>
                      )}
                    </div>
                  )}

                  <div className="form-check mb-4">
                    <input
                      id="chk-datos"
                      type="checkbox"
                      className={`form-check-input ${errores.aceptaDatos ? "is-invalid" : ""}`}
                      checked={datos.aceptaDatos}
                      onChange={(e) =>
                        setDatos({ ...datos, aceptaDatos: e.target.checked })
                      }
                    />
                    <label htmlFor="chk-datos" className="form-check-label small">
                      Acepto los términos de compra y autorizo el tratamiento de mis datos personales según la{" "}
                      <Link to="/politica-de-datos" target="_blank" className="text-gold">
                        Política de Tratamiento de Datos (Ley 1581 de 2012)
                      </Link>{" "}
                      *
                    </label>
                    {errores.aceptaDatos && (
                      <div className="invalid-feedback d-block">{errores.aceptaDatos}</div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setPaso(2)}
                    >
                      ← Volver a envío
                    </button>
                    <button
                      type="submit"
                      className="btn btn-gold btn-lg"
                      disabled={procesando}
                    >
                      {procesando
                        ? "Procesando transacción..."
                        : `Pagar y emitir factura (${formatearMonedaCOP(totalCarrito)})`}
                    </button>
                  </div>
                </section>
              )}
            </form>
          </div>
        </div>

        {/* Resumen lateral del pedido */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 p-4 bg-soft">
            <h2 className="h5 mb-3">Resumen del Pedido ({carrito.length} obras)</h2>
            <ul className="list-group list-group-flush mb-3 rounded">
              {carrito.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item d-flex justify-content-between align-items-center bg-white"
                >
                  <div>
                    <div className="fw-semibold small">{item.titulo}</div>
                    <div className="small text-muted">
                      Cantidad: {item.cantidad} × {formatearMonedaCOP(item.precio)}
                    </div>
                  </div>
                  <span className="fw-bold small">
                    {formatearMonedaCOP(item.precio * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="d-flex justify-content-between small mb-1">
              <span>Subtotal:</span>
              <span>{formatearMonedaCOP(subtotalCarrito)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-1">
              <span>IVA (19 %):</span>
              <span>{formatearMonedaCOP(ivaCarrito)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-2">
              <span>Envío asegurado:</span>
              <span className="text-success fw-semibold">$0 COP</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-baseline">
              <span className="fw-bold">Total:</span>
              <span className="fs-4 fw-bold text-dark">
                {formatearMonedaCOP(totalCarrito)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Vista de Factura Electrónica Imprimible y Descargable en PDF (/pedido/:id/factura)
 * Cumple los puntos 3A.b y 3A.f: logotipo de la empresa, número consecutivo,
 * IVA 19 %, subtotal, total, vista imprimible y descarga en PDF.
 */
export const FacturaPage = () => {
  const { id } = useParams();
  const [pedido, setPedido] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/pedidos/${id}/factura`)
      .then((res) => {
        if (!res.err && res.pedido) setPedido(res.pedido);
        setCargando(false);
      });
  }, [id]);

  if (cargando) {
    return (
      <div className="container py-5">
        <Loader texto="Generando factura electrónica..." />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="container py-5 text-center">
        <h1 className="h3">Factura no encontrada</h1>
        <Link to="/obras" className="btn btn-gold mt-3">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="no-print">
        <Breadcrumbs
          items={[
            { label: "Catálogo", to: "/obras" },
            { label: `Factura ${pedido.numeroFactura}` },
          ]}
        />
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 no-print">
        <div className="alert alert-success mb-0 py-2 px-3">
          <i className="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
          ¡Compra confirmada! El stock del inventario fue actualizado automáticamente.
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => window.print()}
          >
            <i className="bi bi-file-earmark-pdf me-1" aria-hidden="true"></i>
            Imprimir / Descargar Factura en PDF
          </button>
          <Link to="/obras" className="btn btn-outline-dark">
            Volver al catálogo
          </Link>
        </div>
      </div>

      {/* Documento de Factura */}
      <article
        className="card shadow-sm border p-4 p-md-5 bg-white"
        aria-label={`Factura de venta ${pedido.numeroFactura}`}
      >
        <div className="row justify-content-between align-items-center border-bottom pb-4 mb-4">
          <div className="col-md-6">
            <img
              src="/logo.svg"
              alt="Logotipo Galería Prismas"
              height="52"
              className="mb-2"
            />
            <div className="small text-muted">
              <strong>{EMPRESA.responsableDatos}</strong>
              <br />
              NIT: {EMPRESA.nit} · Régimen Común
              <br />
              {EMPRESA.direccion}
            </div>
          </div>
          <div className="col-md-5 text-md-end mt-3 mt-md-0">
            <span className="badge bg-success mb-1">PAGO {pedido.estadoPago}</span>
            <h1 className="h3 mb-1">Factura N.º {pedido.numeroFactura}</h1>
            <p className="small text-muted mb-0">
              Fecha de emisión: {formatearFechaES(pedido.fecha)}
              <br />
              Medio de pago: {pedido.metodoPago}{" "}
              {pedido.ultimos4Tarjeta ? `(**** ${pedido.ultimos4Tarjeta})` : ""}
            </p>
          </div>
        </div>

        <div className="row g-3 mb-4 small">
          <div className="col-md-6">
            <div className="p-3 bg-soft rounded border h-100">
              <h2 className="h6 fw-bold text-uppercase text-gold">Datos del Adquiriente</h2>
              <div>
                <strong>Nombre:</strong> {pedido.nombreCliente}
              </div>
              <div>
                <strong>Documento:</strong> {pedido.documentoCliente}
              </div>
              <div>
                <strong>Correo:</strong> {pedido.correoCliente}
              </div>
              <div>
                <strong>Celular:</strong> {pedido.celularCliente}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="p-3 bg-soft rounded border h-100">
              <h2 className="h6 fw-bold text-uppercase text-gold">Datos de Entrega Asegurada</h2>
              <div>
                <strong>Dirección:</strong> {pedido.direccionEnvio}
              </div>
              <div>
                <strong>Ciudad:</strong> {pedido.ciudadEnvio}, Colombia
              </div>
              <div>
                <strong>Observaciones:</strong> {pedido.notasEnvio || "Embalaje museográfico estándar"}
              </div>
            </div>
          </div>
        </div>

        <div className="table-responsive mb-4">
          <table className="table table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th scope="col">Ítem / Obra Certificada</th>
                <th scope="col" className="text-center">
                  Cantidad
                </th>
                <th scope="col" className="text-end">
                  Valor Unitario
                </th>
                <th scope="col" className="text-end">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {(pedido.detalles || []).map((det) => (
                <tr key={det.id}>
                  <td>
                    <strong>{det.tituloObra}</strong>
                    {det.obra && (
                      <div className="small text-muted">
                        Código: {det.obra.codigo} · Técnica: {det.obra.tecnica} ({det.obra.dimensiones})
                      </div>
                    )}
                  </td>
                  <td className="text-center">{det.cantidad}</td>
                  <td className="text-end">{formatearMonedaCOP(det.precioUnitario)}</td>
                  <td className="text-end fw-semibold">{formatearMonedaCOP(det.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="row justify-content-end">
          <div className="col-md-5">
            <div className="d-flex justify-content-between py-1">
              <span>Subtotal Base Gravable:</span>
              <span className="fw-semibold">{formatearMonedaCOP(pedido.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between py-1">
              <span>IVA (19 %):</span>
              <span className="fw-semibold">{formatearMonedaCOP(pedido.iva)}</span>
            </div>
            <div className="d-flex justify-content-between py-1 border-bottom">
              <span>Transporte Asegurado:</span>
              <span className="text-success fw-semibold">$0 COP</span>
            </div>
            <div className="d-flex justify-content-between py-2 fs-5 fw-bold">
              <span>TOTAL FACTURADO:</span>
              <span>{formatearMonedaCOP(pedido.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-top small text-muted text-center">
          Certificado de autenticidad emitido por Galería Prismas. Documento generado en ambiente académico de demostración.
        </div>
      </article>
    </div>
  );
};
