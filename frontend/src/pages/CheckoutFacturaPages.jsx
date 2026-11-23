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
 * Formatea un número de tarjeta en bloques de 4 dígitos para visualización en tiempo real.
 */
function formatearNumeroTarjetaVisual(num = "") {
  const limpio = String(num).replace(/\D/g, "").slice(0, 16);
  if (!limpio) return "•••• •••• •••• ••••";
  return limpio.replace(/(\d{4})(?=\d)/g, "$1 ");
}

/**
 * Detecta la franquicia de la tarjeta según el primer dígito (BIN).
 */
function detectarFranquicia(num = "") {
  const limpio = String(num).replace(/\D/g, "");
  if (limpio.startsWith("4")) return "VISA";
  if (/^5[1-5]/.test(limpio) || /^2[2-7]/.test(limpio)) return "MASTERCARD";
  if (/^3[47]/.test(limpio)) return "AMEX";
  return "PRISMAPAY CARD";
}

/**
 * Checkout y Pasarela de Pago Interactiva "PrismaPay" (/checkout y /pasarela)
 * Cumple el punto 3A.s y las Heurísticas #1, #3, #5, #9, #10:
 * - Selector rápido de obras si el usuario entra directo a /pasarela con el carrito vacío
 * - Paso 1: Datos del comprador (con botón de autocompletado rápido para sustentación)
 * - Paso 2: Dirección de envío asegurado
 * - Paso 3: Pasarela de Pagos con Tarjeta 3D interactiva (validación Luhn en vivo y 3 tarjetas de prueba),
 *   PSE (ACH Colombia), Nequi / Daviplata y Código QR Bancolombia.
 * - Simulación visual paso a paso de autorización bancaria 3D Secure.
 * - Aviso visible: "Pasarela de demostración, no se procesan pagos reales"
 */
export const CheckoutPage = () => {
  const {
    carrito,
    agregarAlCarrito,
    subtotalCarrito,
    ivaCarrito,
    totalCarrito,
    vaciarCarrito,
    mostrarToast,
  } = useApp();
  const navigate = useNavigate();

  const [paso, setPaso] = useState(1);
  const [procesando, setProcesando] = useState(false);
  const [etapaPasarela, setEtapaPasarela] = useState(0);
  const [errores, setErrores] = useState({});
  const [obrasDisponibles, setObrasDisponibles] = useState([]);
  const [cargandoObras, setCargandoObras] = useState(false);

  const [datos, setDatos] = useState({
    nombreCliente: "Carlos Andrés Mendoza",
    documentoCliente: "1020765432",
    correoCliente: "carlos.mendoza@coleccionista.co",
    celularCliente: "3154829103",
    direccionEnvio: "Carrera 11 # 84-42 Apto 502",
    ciudadEnvio: "Bogotá",
    notasEnvio: "Incluir certificado curatorial firmado y embalaje climatizado.",
    metodoPago: "TARJETA",
    tipoTarjeta: "CREDITO",
    cuotas: "1",
    numeroTarjeta: "4242424242424242",
    titularTarjeta: "CARLOS ANDRES MENDOZA",
    vencimiento: "12/29",
    cvv: "842",
    tipoPersonaPse: "NATURAL",
    bancoPse: "Bancolombia",
    celularNequi: "3154829103",
    billeteraMovil: "Nequi",
    aceptaDatos: true,
  });

  // Si el carrito está vacío, cargamos obras disponibles para que pueda probar la pasarela en 1 clic
  useEffect(() => {
    if (carrito.length === 0) {
      setCargandoObras(true);
      helpFetch()
        .get(`${EMPRESA.apiBaseUrl}/obras?estado=Disponible&limit=6`)
        .then((res) => {
          if (!res.err && res.datos) {
            setObrasDisponibles(res.datos.filter((o) => o.stock > 0));
          }
          setCargandoObras(false);
        });
    }
  }, [carrito.length]);

  // Botones de autocompletado de tarjetas de prueba documentadas en el README y rúbrica 3A.s
  const cargarTarjetaPrueba = (tipo) => {
    if (tipo === "APROBADA") {
      setDatos((prev) => ({
        ...prev,
        metodoPago: "TARJETA",
        numeroTarjeta: "4242424242424242",
        titularTarjeta: (prev.nombreCliente || "CARLOS MENDOZA").toUpperCase(),
        vencimiento: "12/29",
        cvv: "842",
      }));
    } else if (tipo === "RECHAZADA") {
      setDatos((prev) => ({
        ...prev,
        metodoPago: "TARJETA",
        numeroTarjeta: "4000000000000002",
        titularTarjeta: (prev.nombreCliente || "CARLOS MENDOZA").toUpperCase(),
        vencimiento: "12/29",
        cvv: "123",
      }));
    } else if (tipo === "FONDOS") {
      setDatos((prev) => ({
        ...prev,
        metodoPago: "TARJETA",
        numeroTarjeta: "4111111111111111",
        titularTarjeta: (prev.nombreCliente || "CARLOS MENDOZA").toUpperCase(),
        vencimiento: "12/29",
        cvv: "999",
      }));
    }
    setErrores({});
  };

  const autocompletarCompradorDemo = (irDirectoAPago = false) => {
    setDatos((prev) => ({
      ...prev,
      nombreCliente: "Carlos Andrés Mendoza",
      documentoCliente: "1020765432",
      correoCliente: "carlos.mendoza@coleccionista.co",
      celularCliente: "3154829103",
      direccionEnvio: "Carrera 11 # 84-42 Apto 502",
      ciudadEnvio: "Bogotá",
      notasEnvio: "Entregar en recepción con certificado de autenticidad.",
      titularTarjeta: "CARLOS ANDRES MENDOZA",
      aceptaDatos: true,
    }));
    setErrores({});
    if (irDirectoAPago) {
      setPaso(3);
    }
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
    setEtapaPasarela(1);
    setErrores({});

    // Simulación visual de etapas de la pasarela bancaria (SSL -> Luhn/3DS -> Banco)
    setTimeout(() => setEtapaPasarela(2), 350);
    setTimeout(() => setEtapaPasarela(3), 700);

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
        cuotas: datos.cuotas,
        tipoTarjeta: datos.tipoTarjeta,
        banco: datos.bancoPse,
        celularNequi: datos.celularNequi || datos.celularCliente,
      },
      items: carrito.map((i) => ({
        obraId: i.id,
        cantidad: i.cantidad,
      })),
    };

    setTimeout(() => {
      helpFetch()
        .post(`${EMPRESA.apiBaseUrl}/checkout`, { body: payload })
        .then((res) => {
          if (!res.err && res.pedido) {
            vaciarCarrito();
            mostrarToast(
              `Transacción Aprobada en PrismaPay. Factura ${res.pedido.numeroFactura} emitida.`,
              "success"
            );
            navigate(`/pedido/${res.pedido.id}/factura`);
          } else {
            setErrores({
              general:
                res.statusText ||
                "La transacción fue rechazada por la entidad financiera. Revisa los datos del medio de pago.",
            });
          }
          setProcesando(false);
          setEtapaPasarela(0);
        });
    }, 950);
  };

  const luhnValidoEnVivo =
    datos.numeroTarjeta.replace(/\D/g, "").length >= 13 &&
    validarLuhn(datos.numeroTarjeta);

  if (carrito.length === 0) {
    return (
      <div className="container py-4">
        <Breadcrumbs items={[{ label: "Pasarela de Pagos PrismaPay" }]} />

        <div className="alert alert-warning d-flex align-items-center gap-2 shadow-sm mb-4" role="note">
          <i className="bi bi-shield-lock-fill fs-4" aria-hidden="true"></i>
          <div>
            <strong>Pasarela de Pagos PrismaPay (Ambiente Académico Simulado SSL 256-bit).</strong> Selecciona cualquier obra disponible a continuación para cargarla en la pasarela y probar pagos con Tarjeta (Algoritmo de Luhn), PSE, Nequi o QR Bancolombia.
          </div>
        </div>

        <div className="card shadow-sm border-0 p-4 mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <div>
              <span className="badge bg-warning text-dark mb-1">Paso previo rápido</span>
              <h1 className="h3 mb-1">Selecciona una Obra para Procesar en la Pasarela de Pago</h1>
              <p className="text-muted small mb-0">
                Tu carrito está vacío en este momento. Haz clic en <strong>&ldquo;Cargar en Pasarela&rdquo;</strong> sobre cualquier obra para abrir el procesador de pagos inmediatamente:
              </p>
            </div>
            <Link to="/obras" className="btn btn-outline-dark btn-sm">
              Ver catálogo completo (22 obras)
            </Link>
          </div>

          {cargandoObras ? (
            <Loader texto="Cargando obras disponibles para la pasarela..." />
          ) : (
            <div className="row g-3">
              {obrasDisponibles.map((obra) => (
                <div key={obra.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border shadow-sm">
                    <div className="row g-0 align-items-center p-2">
                      <div className="col-4">
                        <img
                          src={obra.imagenUrl}
                          alt={obra.titulo}
                          className="img-fluid rounded"
                          style={{ height: "95px", width: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div className="col-8 ps-3">
                        <span className="badge bg-dark small mb-1">{obra.tecnica}</span>
                        <h2 className="h6 mb-1 text-truncate" title={obra.titulo}>
                          {obra.titulo}
                        </h2>
                        <div className="fw-bold text-gold small mb-2">
                          {formatearMonedaCOP(obra.precio)} + IVA
                        </div>
                        <button
                          type="button"
                          className="btn btn-gold btn-sm w-100"
                          onClick={() => {
                            agregarAlCarrito(obra, 1);
                            setPaso(3);
                          }}
                        >
                          <i className="bi bi-credit-card-2-front me-1" aria-hidden="true"></i>
                          Cargar en Pasarela
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Breadcrumbs
        items={[
          { label: "Carrito", to: "/carrito" },
          { label: "Pasarela de Pagos PrismaPay" },
        ]}
      />

      {/* Aviso obligatorio rúbrica 3A.s + sellos de seguridad de la pasarela */}
      <div className="alert alert-warning d-flex flex-wrap justify-content-between align-items-center gap-2 shadow-sm mb-4" role="note">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-shield-check fs-3 text-dark" aria-hidden="true"></i>
          <div>
            <strong>Pasarela de demostración, no se procesan pagos reales.</strong>
            <div className="small">
              Procesador académico <strong>PrismaPay Gateway v2.6</strong> · Validación Luhn · Control transaccional de stock · Facturación DIAN (IVA 19 %).
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-dark">
            <i className="bi bi-lock-fill me-1" aria-hidden="true"></i>TLS 1.3 / SSL
          </span>
          <span className="badge bg-secondary">PCI-DSS Simulado</span>
          <span className="badge bg-success">3D Secure 2.0</span>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h2 mb-0">
            <i className="bi bi-credit-card-2-front text-gold me-2" aria-hidden="true"></i>
            Pasarela de Pagos — Galería Prismas
          </h1>
        </div>
        <div className="d-flex gap-2 mt-2 mt-md-0">
          <button
            type="button"
            className="btn btn-outline-dark btn-sm"
            onClick={() => autocompletarCompradorDemo(true)}
          >
            <i className="bi bi-lightning-charge-fill text-warning me-1" aria-hidden="true"></i>
            Ir directo al Pago con Datos Demo
          </button>
        </div>
      </div>

      {/* Barra de progreso interactiva en 3 pasos (Heurística #1) */}
      <div className="mb-4" aria-label="Progreso del checkout">
        <div className="row g-2 mb-2">
          {[
            { num: 1, titulo: "1. Datos del Comprador", icono: "bi-person-vcard" },
            { num: 2, titulo: "2. Envío Museográfico", icono: "bi-truck" },
            { num: 3, titulo: "3. Pasarela de Pago", icono: "bi-credit-card-2-front-fill" },
          ].map((item) => (
            <div className="col-4" key={item.num}>
              <button
                type="button"
                className={`btn w-100 btn-sm text-truncate ${
                  paso === item.num
                    ? "btn-dark fw-bold"
                    : paso > item.num
                    ? "btn-outline-success fw-semibold"
                    : "btn-outline-secondary"
                }`}
                onClick={() => {
                  if (item.num === 1) setPaso(1);
                  else if (item.num === 2 && validarPaso1()) setPaso(2);
                  else if (item.num === 3 && validarPaso1() && validarPaso2()) setPaso(3);
                }}
              >
                <i className={`bi ${item.icono} me-1`} aria-hidden="true"></i>
                {item.titulo}
              </button>
            </div>
          ))}
        </div>
        <div className="progress" style={{ height: "8px" }}>
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
              <div className="alert alert-danger d-flex align-items-center gap-3 shadow-sm" role="alert">
                <i className="bi bi-x-octagon-fill fs-3" aria-hidden="true"></i>
                <div>
                  <div className="fw-bold">Respuesta de la Pasarela Bancaria: Transacción Declinada</div>
                  <div className="small">{errores.general}</div>
                </div>
              </div>
            )}

            {/* Modal/Panel de procesamiento bancario paso a paso */}
            {procesando && (
              <div className="alert alert-info border-0 shadow-sm p-4 mb-4" role="status" aria-live="polite">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="spinner-border text-dark" role="status" aria-hidden="true"></div>
                  <div>
                    <h2 className="h6 fw-bold mb-0">
                      Procesando transacción en Pasarela PrismaPay ({datos.metodoPago})...
                    </h2>
                    <span className="small text-muted">
                      No cierres ni recargues esta ventana mientras nos comunicamos con el banco.
                    </span>
                  </div>
                </div>
                <ul className="list-unstyled small mb-0 d-flex flex-column gap-1">
                  <li className={etapaPasarela >= 1 ? "text-success fw-semibold" : "text-muted"}>
                    <i className={`bi ${etapaPasarela >= 1 ? "bi-check-circle-fill" : "bi-circle"} me-2`}></i>
                    1. Cifrado TLS 1.3 y verificación de algoritmo de Luhn / formato bancario
                  </li>
                  <li className={etapaPasarela >= 2 ? "text-success fw-semibold" : "text-muted"}>
                    <i className={`bi ${etapaPasarela >= 2 ? "bi-check-circle-fill" : "bi-circle"} me-2`}></i>
                    2. Autenticación 3D Secure y solicitud de autorización al banco emisor
                  </li>
                  <li className={etapaPasarela >= 3 ? "text-primary fw-semibold" : "text-muted"}>
                    <i className={`bi ${etapaPasarela >= 3 ? "bi-arrow-repeat" : "bi-circle"} me-2`}></i>
                    3. Descuento atómico de inventario y generación de Factura Electrónica DIAN
                  </li>
                </ul>
              </div>
            )}

            <form onSubmit={handleConfirmarPago} noValidate>
              {/* PASO 1: DATOS PERSONALES */}
              {paso === 1 && (
                <section aria-label="Paso 1: Datos del comprador">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0">Paso 1: Datos del Titular / Facturación</h2>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => autocompletarCompradorDemo(false)}
                    >
                      Cargar datos de ejemplo
                    </button>
                  </div>
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
                          setDatos({
                            ...datos,
                            nombreCliente: e.target.value,
                            titularTarjeta: e.target.value.toUpperCase(),
                          })
                        }
                      />
                      {errores.nombreCliente && (
                        <div className="invalid-feedback">{errores.nombreCliente}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="chk-doc" className="form-label fw-semibold small">
                        Cédula / NIT (6 a 10 dígitos) *
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
                        Correo electrónico para envío de Factura PDF *
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
                        Ciudad destino *
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
                      Siguiente: Abrir Pasarela de Pago →
                    </button>
                  </div>
                </section>
              )}

              {/* PASO 3: PASARELA DE PAGO INTERACTIVA */}
              {paso === 3 && (
                <section aria-label="Paso 3: Pasarela de pago">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                    <h2 className="h4 mb-0">Paso 3: Selecciona tu Medio de Pago</h2>
                    <span className="badge bg-success">
                      <i className="bi bi-shield-lock me-1" aria-hidden="true"></i>
                      Conexión Bancaria Cifrada
                    </span>
                  </div>

                  {/* Selector de 4 métodos de pago colombianos */}
                  <div className="row g-2 mb-4" role="radiogroup" aria-label="Medios de pago disponibles">
                    {[
                      {
                        id: "TARJETA",
                        titulo: "Tarjeta Crédito / Débito",
                        sub: "Visa · Mastercard · Amex",
                        icono: "bi-credit-card-2-front-fill",
                      },
                      {
                        id: "PSE",
                        titulo: "PSE — ACH Colombia",
                        sub: "Débito cuentas ahorros/corriente",
                        icono: "bi-bank2",
                      },
                      {
                        id: "NEQUI",
                        titulo: "Nequi / Daviplata",
                        sub: "Billetera digital inmediata",
                        icono: "bi-phone-vibrate-fill",
                      },
                      {
                        id: "TRANSFERENCIA_QR",
                        titulo: "Código QR Bancolombia",
                        sub: "Escaneo sin comisión",
                        icono: "bi-qr-code-scan",
                      },
                    ].map((m) => (
                      <div className="col-6 col-md-3" key={m.id}>
                        <button
                          type="button"
                          className={`btn w-100 h-100 p-2 text-start border rounded-3 ${
                            datos.metodoPago === m.id
                              ? "btn-dark border-warning shadow-sm"
                              : "btn-light"
                          }`}
                          onClick={() => setDatos({ ...datos, metodoPago: m.id })}
                          aria-pressed={datos.metodoPago === m.id}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <i
                              className={`bi ${m.icono} fs-5 ${
                                datos.metodoPago === m.id ? "text-warning" : "text-gold"
                              }`}
                              aria-hidden="true"
                            ></i>
                            {datos.metodoPago === m.id && (
                              <span className="badge bg-warning text-dark" style={{ fontSize: "0.65rem" }}>
                                Activo
                              </span>
                            )}
                          </div>
                          <div className="fw-bold small lh-sm">{m.titulo}</div>
                          <div
                            className={`small ${
                              datos.metodoPago === m.id ? "text-light opacity-75" : "text-muted"
                            }`}
                            style={{ fontSize: "0.72rem" }}
                          >
                            {m.sub}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* MÉTODO 1: TARJETA DE CRÉDITO / DÉBITO CON PREVISUALIZACIÓN 3D INTERACTIVA */}
                  {datos.metodoPago === "TARJETA" && (
                    <div className="p-3 bg-soft rounded-3 border mb-3">
                      {/* Tarjeta 3D Visual en vivo */}
                      <div
                        className="p-4 rounded-4 text-white shadow mb-3 position-relative overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg, #141413 0%, #2c2517 55%, #8A6516 100%)",
                          minHeight: "195px",
                          border: "1px solid #D4AF37",
                        }}
                        aria-label="Vista previa interactiva de la tarjeta"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <div className="d-flex align-items-center gap-2">
                            {/* Chip EMV dorado */}
                            <div
                              style={{
                                width: "44px",
                                height: "32px",
                                background: "linear-gradient(135deg, #fde047, #ca8a04)",
                                borderRadius: "6px",
                                border: "1px solid #713f12",
                              }}
                            ></div>
                            <i className="bi bi-wifi fs-5 text-warning" aria-hidden="true"></i>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-warning text-dark fw-bold px-2 py-1">
                              {detectarFranquicia(datos.numeroTarjeta)}
                            </span>
                            <div className="small text-light opacity-75" style={{ fontSize: "0.7rem" }}>
                              {datos.tipoTarjeta === "CREDITO"
                                ? `CRÉDITO · ${datos.cuotas} ${
                                    datos.cuotas === "1" ? "CUOTA" : "CUOTAS"
                                  }`
                                : "DÉBITO AHORROS"}
                            </div>
                          </div>
                        </div>

                        <div
                          className="fs-4 fw-bold mb-3"
                          style={{ letterSpacing: "2.5px", fontFamily: "monospace" }}
                        >
                          {formatearNumeroTarjetaVisual(datos.numeroTarjeta)}
                        </div>

                        <div className="d-flex justify-content-between align-items-end">
                          <div>
                            <div className="text-uppercase opacity-75" style={{ fontSize: "0.65rem" }}>
                              Titular de la tarjeta
                            </div>
                            <div className="fw-semibold small text-uppercase">
                              {datos.titularTarjeta || datos.nombreCliente || "NOMBRE DEL TITULAR"}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="text-uppercase opacity-75" style={{ fontSize: "0.65rem" }}>
                              Vence · CVV
                            </div>
                            <div className="fw-semibold small">
                              {datos.vencimiento || "MM/AA"} · {datos.cvv ? "•••" : "CVV"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botones de escenarios de prueba en 1 clic */}
                      <div className="mb-3 p-2 bg-white rounded border">
                        <span className="small fw-bold d-block mb-2">
                          <i className="bi bi-magic text-gold me-1" aria-hidden="true"></i>
                          Simulador de escenarios bancarios en 1 clic (para sustentación):
                        </span>
                        <div className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => cargarTarjetaPrueba("APROBADA")}
                          >
                            <i className="bi bi-check-circle me-1" aria-hidden="true"></i>
                            1. Tarjeta Aprobada (4242...4242)
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => cargarTarjetaPrueba("RECHAZADA")}
                          >
                            <i className="bi bi-x-circle me-1" aria-hidden="true"></i>
                            2. Tarjeta Rechazada (4000...0002)
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-warning text-dark btn-sm"
                            onClick={() => cargarTarjetaPrueba("FONDOS")}
                          >
                            <i className="bi bi-exclamation-triangle me-1" aria-hidden="true"></i>
                            3. Fondos Insuficientes (4111...1111)
                          </button>
                        </div>
                      </div>

                      <div className="row g-3">
                        <div className="col-md-8">
                          <div className="d-flex justify-content-between align-items-center">
                            <label htmlFor="chk-tarjeta" className="form-label small fw-semibold mb-1">
                              Número de tarjeta (16 dígitos) *
                            </label>
                            <span
                              className={`badge ${
                                luhnValidoEnVivo ? "bg-success" : "bg-secondary"
                              }`}
                              style={{ fontSize: "0.7rem" }}
                            >
                              {luhnValidoEnVivo
                                ? "✓ Algoritmo de Luhn Válido"
                                : "Validación Luhn activa"}
                            </span>
                          </div>
                          <input
                            id="chk-tarjeta"
                            type="text"
                            maxLength={19}
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

                        <div className="col-md-4">
                          <label htmlFor="chk-cuotas" className="form-label small fw-semibold mb-1">
                            Diferir a cuotas
                          </label>
                          <select
                            id="chk-cuotas"
                            className="form-select"
                            value={datos.cuotas}
                            onChange={(e) =>
                              setDatos({ ...datos, cuotas: e.target.value })
                            }
                          >
                            <option value="1">1 cuota (Sin intereses)</option>
                            <option value="3">3 cuotas</option>
                            <option value="6">6 cuotas</option>
                            <option value="12">12 cuotas</option>
                            <option value="24">24 cuotas</option>
                            <option value="36">36 cuotas</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label htmlFor="chk-titular" className="form-label small fw-semibold">
                            Nombre impreso en la tarjeta *
                          </label>
                          <input
                            id="chk-titular"
                            type="text"
                            className="form-control text-uppercase"
                            placeholder="CARLOS ANDRES MENDOZA"
                            value={datos.titularTarjeta}
                            onChange={(e) =>
                              setDatos({
                                ...datos,
                                titularTarjeta: e.target.value.toUpperCase(),
                              })
                            }
                          />
                        </div>

                        <div className="col-sm-3 col-6">
                          <label htmlFor="chk-venc" className="form-label small fw-semibold">
                            Vencimiento (MM/AA) *
                          </label>
                          <input
                            id="chk-venc"
                            type="text"
                            maxLength={5}
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

                        <div className="col-sm-3 col-6">
                          <label htmlFor="chk-cvv" className="form-label small fw-semibold">
                            CVV / CVC *
                          </label>
                          <input
                            id="chk-cvv"
                            type="text"
                            maxLength={4}
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

                  {/* MÉTODO 2: PSE — ACH COLOMBIA */}
                  {datos.metodoPago === "PSE" && (
                    <div className="p-3 bg-soft rounded-3 border mb-3">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="badge bg-primary px-3 py-2">PSE · ACH Colombia</span>
                        <span className="small text-muted">
                          Débito seguro desde cuenta de ahorros o corriente
                        </span>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-5">
                          <label htmlFor="chk-tipopersona" className="form-label small fw-semibold">
                            Tipo de cliente
                          </label>
                          <select
                            id="chk-tipopersona"
                            className="form-select"
                            value={datos.tipoPersonaPse}
                            onChange={(e) =>
                              setDatos({ ...datos, tipoPersonaPse: e.target.value })
                            }
                          >
                            <option value="NATURAL">Persona Natural</option>
                            <option value="JURIDICA">Persona Jurídica (Empresa)</option>
                          </select>
                        </div>
                        <div className="col-md-7">
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
                            <option value="Davivienda">Banco Davivienda (Simulación Aprobada)</option>
                            <option value="Banco de Bogotá">Banco de Bogotá (Simulación Aprobada)</option>
                            <option value="BBVA Colombia">BBVA Colombia (Simulación Aprobada)</option>
                            <option value="Scotiabank Colpatria">Scotiabank Colpatria (Simulación Aprobada)</option>
                            <option value="Nequi PSE">Nequi — Débito PSE (Simulación Aprobada)</option>
                            <option value="BANCO_RECHAZADO">
                              Banco de Prueba Rechazado (Simular Declinación PSE)
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MÉTODO 3: NEQUI / DAVIPLATA */}
                  {datos.metodoPago === "NEQUI" && (
                    <div className="p-3 bg-soft rounded-3 border mb-3">
                      <div className="row g-3 align-items-center">
                        <div className="col-md-5">
                          <label htmlFor="chk-billetera" className="form-label small fw-semibold">
                            Billetera digital
                          </label>
                          <select
                            id="chk-billetera"
                            className="form-select"
                            value={datos.billeteraMovil}
                            onChange={(e) =>
                              setDatos({ ...datos, billeteraMovil: e.target.value })
                            }
                          >
                            <option value="Nequi">Nequi (Notificación Push)</option>
                            <option value="Daviplata">Daviplata</option>
                          </select>
                        </div>
                        <div className="col-md-7">
                          <label htmlFor="chk-nequi" className="form-label small fw-semibold">
                            Número celular vinculado a {datos.billeteraMovil} *
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
                      </div>
                      <div className="small text-muted mt-2">
                        <i className="bi bi-info-circle me-1" aria-hidden="true"></i>
                        Se enviará una notificación de confirmación simulada al celular registrado.
                      </div>
                    </div>
                  )}

                  {/* MÉTODO 4: CÓDIGO QR BANCOLOMBIA / TRANSFERENCIA */}
                  {datos.metodoPago === "TRANSFERENCIA_QR" && (
                    <div className="p-3 bg-soft rounded-3 border mb-3 text-center">
                      <div className="fw-bold small mb-2">
                        Escanea el Código QR PrismaPay — Bancolombia A la Mano / App Personas
                      </div>
                      <div
                        className="d-inline-block p-3 bg-white border rounded-3 shadow-sm mb-2"
                        aria-label="Código QR de pago simulado"
                      >
                        <svg width="130" height="130" viewBox="0 0 130 130">
                          <rect width="130" height="130" fill="#ffffff" />
                          <rect x="10" y="10" width="36" height="36" fill="none" stroke="#141413" strokeWidth="6" />
                          <rect x="20" y="20" width="16" height="16" fill="#8A6516" />
                          <rect x="84" y="10" width="36" height="36" fill="none" stroke="#141413" strokeWidth="6" />
                          <rect x="94" y="20" width="16" height="16" fill="#8A6516" />
                          <rect x="10" y="84" width="36" height="36" fill="none" stroke="#141413" strokeWidth="6" />
                          <rect x="20" y="94" width="16" height="16" fill="#8A6516" />
                          <rect x="54" y="22" width="10" height="10" fill="#141413" />
                          <rect x="54" y="54" width="22" height="22" fill="#8A6516" />
                          <rect x="86" y="58" width="12" height="12" fill="#141413" />
                          <rect x="54" y="88" width="14" height="24" fill="#141413" />
                          <rect x="84" y="84" width="32" height="32" fill="none" stroke="#141413" strokeWidth="4" strokeDasharray="8,4" />
                        </svg>
                      </div>
                      <div className="small text-muted">
                        Convenio Galería Prismas NIT {EMPRESA.nit} · Valor exacto:{" "}
                        <strong>{formatearMonedaCOP(totalCarrito)}</strong>
                      </div>
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

                  <div className="d-flex flex-wrap justify-content-between gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setPaso(2)}
                    >
                      ← Volver a envío
                    </button>
                    <button
                      type="submit"
                      className="btn btn-gold btn-lg shadow-sm"
                      disabled={procesando}
                    >
                      <i className="bi bi-lock-fill me-2" aria-hidden="true"></i>
                      {procesando
                        ? "Autorizando en Pasarela..."
                        : `Pagar Ahora en Pasarela (${formatearMonedaCOP(totalCarrito)})`}
                    </button>
                  </div>
                </section>
              )}
            </form>
          </div>
        </div>

        {/* Resumen lateral del pedido con miniatura de la imagen acorde al título */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 p-4 bg-soft">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">Resumen de Compra ({carrito.length} obras)</h2>
              <span className="badge bg-dark">PrismaPay SSL</span>
            </div>
            <ul className="list-group list-group-flush mb-3 rounded">
              {carrito.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item d-flex justify-content-between align-items-center bg-white gap-2"
                >
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={item.imagenUrl}
                      alt={item.titulo}
                      width="54"
                      height="44"
                      className="rounded border object-fit-cover"
                    />
                    <div>
                      <div className="fw-semibold small">{item.titulo}</div>
                      <div className="small text-muted">
                        Cant: {item.cantidad} × {formatearMonedaCOP(item.precio)}
                      </div>
                    </div>
                  </div>
                  <span className="fw-bold small text-nowrap">
                    {formatearMonedaCOP(item.precio * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="d-flex justify-content-between small mb-1">
              <span>Subtotal obras:</span>
              <span>{formatearMonedaCOP(subtotalCarrito)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-1">
              <span>IVA (19 % discriminado):</span>
              <span>{formatearMonedaCOP(ivaCarrito)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-2">
              <span>Seguro y transporte museográfico:</span>
              <span className="text-success fw-semibold">$0 COP (Cortesía)</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-baseline mb-3">
              <span className="fw-bold">Total a Pagar:</span>
              <span className="fs-4 fw-bold text-dark">
                {formatearMonedaCOP(totalCarrito)}
              </span>
            </div>

            <div className="p-3 bg-white rounded border small text-muted">
              <div className="fw-semibold text-dark mb-1">
                <i className="bi bi-patch-check-fill text-gold me-1" aria-hidden="true"></i>
                Garantía de Autenticidad y Facturación
              </div>
              Al aprobarse el pago en la pasarela, el sistema descuenta automáticamente el stock en SQLite y emite tu <strong>Factura Electrónica en PDF</strong> con certificado curatorial.
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
            { label: "Pasarela de Pagos", to: "/pasarela" },
            { label: `Factura ${pedido.numeroFactura}` },
          ]}
        />
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 no-print">
        <div className="alert alert-success mb-0 py-2 px-3">
          <i className="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
          ¡Transacción aprobada en Pasarela PrismaPay! El stock del inventario fue actualizado automáticamente.
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
            <span className="badge bg-success mb-2">
              PAGO {pedido.estadoPago} · PASARELA PRISMAPAY
            </span>
            <h1 className="h3 mb-1">FACTURA DE VENTA</h1>
            <div className="fs-5 fw-bold text-gold">{pedido.numeroFactura}</div>
            <div className="small text-muted">
              Fecha de emisión: {formatearFechaES(pedido.fecha)}
            </div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <h2 className="h6 text-uppercase text-muted fw-bold">Datos del Adquiriente</h2>
            <p className="mb-1">
              <strong>Nombre:</strong> {pedido.nombreCliente}
            </p>
            <p className="mb-1">
              <strong>Documento / NIT:</strong> {pedido.documentoCliente}
            </p>
            <p className="mb-1">
              <strong>Correo:</strong> {pedido.correoCliente}
            </p>
            <p className="mb-0">
              <strong>Celular:</strong> {pedido.celularCliente}
            </p>
          </div>

          <div className="col-md-6">
            <h2 className="h6 text-uppercase text-muted fw-bold">
              Despacho y Comprobante de Pasarela
            </h2>
            <p className="mb-1">
              <strong>Dirección de entrega:</strong> {pedido.direccionEnvio} ({pedido.ciudadEnvio})
            </p>
            <p className="mb-1">
              <strong>Medio de pago:</strong> {pedido.metodoPago}
              {pedido.ultimos4Tarjeta ? ` (Terminada en **** ${pedido.ultimos4Tarjeta})` : ""}
            </p>
            <p className="mb-1">
              <strong>Código de autorización CUS:</strong>{" "}
              <code>AUTH-PRISMA-{String(pedido.id).padStart(6, "0")}</code>
            </p>
            {pedido.notasEnvio && (
              <p className="mb-0 small text-muted">
                <strong>Observaciones:</strong> {pedido.notasEnvio}
              </p>
            )}
          </div>
        </div>

        <div className="table-responsive mb-4">
          <table className="table table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th scope="col">Código / Obra</th>
                <th scope="col" className="text-center">
                  Cantidad
                </th>
                <th scope="col" className="text-end">
                  Precio Unitario
                </th>
                <th scope="col" className="text-end">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {pedido.detalles?.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="fw-semibold">{d.tituloObra}</div>
                    {d.obra && (
                      <div className="small text-muted">
                        Código: {d.obra.codigo} · Técnica: {d.obra.tecnica}
                      </div>
                    )}
                  </td>
                  <td className="text-center">{d.cantidad}</td>
                  <td className="text-end">{formatearMonedaCOP(d.precioUnitario)}</td>
                  <td className="text-end fw-semibold">{formatearMonedaCOP(d.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="row justify-content-end">
          <div className="col-md-5">
            <div className="p-3 bg-soft rounded border">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal Base Gravable:</span>
                <strong>{formatearMonedaCOP(pedido.subtotal)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>IVA (19 %):</span>
                <strong>{formatearMonedaCOP(pedido.iva)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío Asegurado:</span>
                <strong>{formatearMonedaCOP(pedido.costoEnvio)}</strong>
              </div>
              <hr />
              <div className="d-flex justify-content-between align-items-baseline">
                <span className="fw-bold">TOTAL PAGADO:</span>
                <span className="fs-4 fw-bold text-dark">
                  {formatearMonedaCOP(pedido.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-top mt-4 pt-3 small text-muted text-center">
          Certificado de autenticidad artística incluido con esta factura · Representación gráfica de facturación académica — {EMPRESA.nombre} ({EMPRESA.ciudad}).
        </div>
      </article>
    </div>
  );
};
