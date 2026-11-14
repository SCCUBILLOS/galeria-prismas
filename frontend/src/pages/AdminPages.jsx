import React, { useState, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate, useParams, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { EMPRESA, formatearMonedaCOP, formatearFechaES } from "../config/empresa";
import { helpFetch } from "../helpers/helpFetch";
import Breadcrumbs from "../components/common/Breadcrumbs";
import CrudApp from "../components/crud/CrudApp";
import Loader from "../components/crud/Loader";

/**
 * Login de Administración (/admin/login)
 * Credenciales por defecto sembradas en seed.js:
 * Correo: admin@galeriaprismas.co
 * Contraseña: AdminPrismas2026*
 */
export const AdminLoginPage = () => {
  const { adminSession, iniciarSesionAdmin } = useApp();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("admin@galeriaprismas.co");
  const [password, setPassword] = useState("AdminPrismas2026*");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (adminSession?.token) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    helpFetch()
      .post(`${EMPRESA.apiBaseUrl}/auth/login`, {
        body: { correo, password },
      })
      .then((res) => {
        if (!res.err && res.token) {
          iniciarSesionAdmin({ token: res.token, usuario: res.usuario });
          navigate("/admin");
        } else {
          setError(res.statusText || "Credenciales inválidas.");
        }
        setCargando(false);
      });
  };

  return (
    <div className="container py-5">
      <Breadcrumbs items={[{ label: "Acceso Administrativo" }]} />

      <div className="card shadow-sm border-0 p-4 mx-auto" style={{ maxWidth: "460px" }}>
        <div className="text-center mb-3">
          <i className="bi bi-shield-lock-fill fs-1 text-gold" aria-hidden="true"></i>
          <h1 className="h3 mt-2">Panel de Administración</h1>
          <p className="small text-muted">
            Autenticación con JWT + bcrypt para gestión de inventario, reportes y CRUD.
          </p>
        </div>

        {error && (
          <div className="alert alert-danger small" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="adm-correo" className="form-label small fw-semibold">
              Correo de administrador *
            </label>
            <input
              id="adm-correo"
              type="email"
              className="form-control"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="adm-pass" className="form-label small fw-semibold">
              Contraseña *
            </label>
            <input
              id="adm-pass"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="p-2 bg-soft rounded border small mb-3">
            <strong>Credenciales de prueba prellenadas:</strong>
            <br />
            Usuario: <code>admin@galeriaprismas.co</code>
            <br />
            Clave: <code>AdminPrismas2026*</code>
          </div>

          <button type="submit" className="btn btn-gold w-100" disabled={cargando}>
            {cargando ? "Verificando token JWT..." : "Ingresar al Panel Administrativo"}
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * Navegación interna del Panel Admin
 */
const AdminNav = () => {
  const { adminSession, cerrarSesionAdmin } = useApp();
  const links = [
    { to: "/admin", label: "Dashboard & Reportes", icon: "bi-bar-chart-line", end: true },
    { to: "/admin/obras", label: "Obras", icon: "bi-easel2" },
    { to: "/admin/artistas", label: "Artistas", icon: "bi-person-badge" },
    { to: "/admin/cursos", label: "Cursos", icon: "bi-journal-richtext" },
    { to: "/admin/exposiciones", label: "Exposiciones", icon: "bi-calendar2-event" },
    { to: "/admin/inventario", label: "Inventario y Stock", icon: "bi-boxes" },
    { to: "/admin/facturas", label: "Facturas", icon: "bi-receipt" },
    { to: "/admin/pqr", label: "Gestión PQR", icon: "bi-chat-square-text" },
    { to: "/admin/clientes", label: "Clientes y Proveedores", icon: "bi-people" },
  ];

  return (
    <div className="bg-dark text-white p-3 rounded-3 mb-4 shadow-sm">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom border-secondary">
        <div>
          <span className="badge bg-warning text-dark me-2">ADMIN JWT ACTIVO</span>
          <strong className="small">{adminSession?.usuario?.nombre}</strong>
        </div>
        <button
          type="button"
          className="btn btn-outline-light btn-sm"
          onClick={cerrarSesionAdmin}
        >
          <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>
          Cerrar sesión
        </button>
      </div>
      <nav className="d-flex flex-wrap gap-2" aria-label="Menú de administración">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `btn btn-sm ${isActive ? "btn-warning fw-bold text-dark" : "btn-outline-light"}`
            }
          >
            <i className={`bi ${l.icon} me-1`} aria-hidden="true"></i>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

/**
 * Dashboard de Reportes Gerenciales con Gráficas (/admin)
 * Cumple el punto 3A.f:
 * - Ventas por mes
 * - Obras más vendidas
 * - Inventario valorizado y alertas de stock bajo
 * - PQR por estado
 */
export const AdminDashboardPage = () => {
  const { adminSession } = useApp();
  const [reportes, setReportes] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!adminSession?.token) return;
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/reportes`, {
        headers: { Authorization: `Bearer ${adminSession.token}` },
      })
      .then((res) => {
        if (!res.err) setReportes(res);
        setCargando(false);
      });
  }, [adminSession]);

  if (!adminSession?.token) return <Navigate to="/admin/login" replace />;

  const maxVentaMes = Math.max(
    1,
    ...(reportes?.ventasPorMes || []).map((v) => v.total)
  );
  const maxObraIngreso = Math.max(
    1,
    ...(reportes?.obrasMasVendidas || []).map((o) => o.ingresos)
  );

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Administración y Reportes" }]} />
      <AdminNav />

      <h1 className="h2 mb-3">Dashboard Gerencial y Reportes Operativos</h1>

      {cargando || !reportes ? (
        <Loader texto="Calculando métricas e indicadores..." />
      ) : (
        <>
          {/* KPIs principales */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 bg-soft h-100">
                <span className="small text-muted">Ingresos Facturados</span>
                <div className="h4 fw-bold text-dark mb-0">
                  {formatearMonedaCOP(reportes.resumen.ingresosTotales)}
                </div>
                <span className="small text-success">
                  {reportes.resumen.totalPedidos} facturas emitidas
                </span>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 bg-soft h-100">
                <span className="small text-muted">Inventario Valorizado</span>
                <div className="h4 fw-bold text-dark mb-0">
                  {formatearMonedaCOP(reportes.resumen.valorTotalInventario)}
                </div>
                <span className="small text-muted">
                  {reportes.resumen.totalUnidadesDisponibles} unidades en stock
                </span>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 bg-soft h-100">
                <span className="small text-muted">Catálogo Activo</span>
                <div className="h4 fw-bold text-dark mb-0">
                  {reportes.resumen.obrasDisponibles} / {reportes.resumen.totalObras} obras
                </div>
                <span className="small text-warning text-dark">
                  Alertas stock bajo: {reportes.resumen.alertasStockCount}
                </span>
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 bg-soft h-100">
                <span className="small text-muted">Solicitudes PQR</span>
                <div className="h4 fw-bold text-dark mb-0">
                  {reportes.resumen.totalPqrs} radicados
                </div>
                <Link to="/admin/pqr" className="small text-gold fw-semibold">
                  Gestionar respuestas →
                </Link>
              </div>
            </div>
          </div>

          <div className="row g-4 mb-4">
            {/* Gráfica 1: Ventas por Mes */}
            <div className="col-lg-6">
              <section className="card border-0 shadow-sm p-4 h-100" aria-label="Gráfica de ventas por mes">
                <h2 className="h5 mb-3">
                  <i className="bi bi-graph-up-arrow text-gold me-2" aria-hidden="true"></i>
                  1. Ventas por Mes (Facturación COP)
                </h2>
                <div className="d-flex flex-column gap-3">
                  {(reportes.ventasPorMes || []).map((v) => {
                    const pct = Math.max(12, Math.round((v.total / maxVentaMes) * 100));
                    return (
                      <div key={v.mes}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-semibold">
                            {v.mes} ({v.cantidadPedidos} pedidos)
                          </span>
                          <span className="fw-bold">{formatearMonedaCOP(v.total)}</span>
                        </div>
                        <div className="progress" style={{ height: "18px" }}>
                          <div
                            className="progress-bar bg-dark"
                            role="progressbar"
                            style={{ width: `${pct}%` }}
                            aria-valuenow={pct}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          >
                            {pct}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Gráfica 2: Obras Más Vendidas */}
            <div className="col-lg-6">
              <section className="card border-0 shadow-sm p-4 h-100" aria-label="Gráfica de obras más vendidas">
                <h2 className="h5 mb-3">
                  <i className="bi bi-trophy text-gold me-2" aria-hidden="true"></i>
                  2. Obras Más Vendidas
                </h2>
                <div className="d-flex flex-column gap-3">
                  {(reportes.obrasMasVendidas || []).map((o) => {
                    const pct = Math.max(
                      15,
                      Math.round((o.ingresos / maxObraIngreso) * 100)
                    );
                    return (
                      <div key={o.obraId}>
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="fw-semibold">
                            {o.titulo} ({o.unidades} ud.)
                          </span>
                          <span className="text-gold fw-bold">
                            {formatearMonedaCOP(o.ingresos)}
                          </span>
                        </div>
                        <div className="progress" style={{ height: "16px" }}>
                          <div
                            className="progress-bar bg-warning text-dark fw-bold"
                            role="progressbar"
                            style={{ width: `${pct}%` }}
                            aria-valuenow={pct}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Gráfica 3: Inventario Valorizado por Técnica */}
            <div className="col-lg-7">
              <section className="card border-0 shadow-sm p-4 h-100" aria-label="Inventario valorizado por técnica">
                <h2 className="h5 mb-3">
                  <i className="bi bi-pie-chart text-gold me-2" aria-hidden="true"></i>
                  3. Inventario Valorizado por Técnica Artística
                </h2>
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Técnica</th>
                        <th scope="col">Obras</th>
                        <th scope="col">Unidades en Stock</th>
                        <th scope="col" className="text-end">
                          Valor Total (COP)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reportes.inventarioValorizado || []).map((inv) => (
                        <tr key={inv.tecnica}>
                          <td className="fw-semibold">{inv.tecnica}</td>
                          <td>{inv.obras}</td>
                          <td>{inv.unidades}</td>
                          <td className="text-end fw-bold">
                            {formatearMonedaCOP(inv.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Gráfica 4: PQR por Estado */}
            <div className="col-lg-5">
              <section className="card border-0 shadow-sm p-4 h-100" aria-label="Solicitudes PQR por estado">
                <h2 className="h5 mb-3">
                  <i className="bi bi-chat-dots text-gold me-2" aria-hidden="true"></i>
                  4. Estado de Solicitudes PQR
                </h2>
                <div className="row g-2 text-center mb-3">
                  {(reportes.pqrPorEstado || []).map((p) => (
                    <div key={p.estado} className="col-4">
                      <div className="p-3 bg-soft rounded border">
                        <div className="display-6 fw-bold">{p.cantidad}</div>
                        <div className="small fw-semibold">{p.estado}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/admin/pqr" className="btn btn-outline-dark btn-sm w-100">
                  Responder y cambiar estados de PQR
                </Link>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Gestión de Inventario, Stock, Alertas y Movimientos (/admin/inventario)
 * Cumple el punto 3A.f:
 * - Movimientos de ENTRADA, SALIDA y AJUSTE con historial.
 * - Alertas de stock bajo.
 */
export const AdminInventarioPage = () => {
  const { adminSession, mostrarToast } = useApp();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [formMov, setFormMov] = useState({
    obraId: "",
    tipo: "ENTRADA",
    cantidad: 2,
    motivo: "Reabastecimiento de serie / ajuste de inventario",
  });

  const cargarInventario = useCallback(() => {
    if (!adminSession?.token) return;
    setCargando(true);
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/inventario`, {
        headers: { Authorization: `Bearer ${adminSession.token}` },
      })
      .then((res) => {
        if (!res.err) {
          setDatos(res);
          if (!formMov.obraId && res.obras?.length > 0) {
            setFormMov((prev) => ({ ...prev, obraId: res.obras[0].id }));
          }
        }
        setCargando(false);
      });
  }, [adminSession]);

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  if (!adminSession?.token) return <Navigate to="/admin/login" replace />;

  const handleMovimiento = (e) => {
    e.preventDefault();
    helpFetch()
      .post(`${EMPRESA.apiBaseUrl}/inventario/movimientos`, {
        headers: { Authorization: `Bearer ${adminSession.token}` },
        body: formMov,
      })
      .then((res) => {
        if (!res.err) {
          mostrarToast("Movimiento de inventario registrado exitosamente.", "success");
          cargarInventario();
        } else {
          mostrarToast(res.statusText || "Error al registrar movimiento", "danger");
        }
      });
  };

  return (
    <div className="container py-4">
      <Breadcrumbs
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Inventario y Movimientos de Stock" },
        ]}
      />
      <AdminNav />

      <h1 className="h2 mb-3">Control de Stock, Alertas y Kardex de Movimientos</h1>

      {cargando || !datos ? (
        <Loader texto="Cargando inventario..." />
      ) : (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h2 className="h5 mb-3">Registrar Movimiento (Entrada / Salida / Ajuste)</h2>
              <form onSubmit={handleMovimiento}>
                <div className="mb-3">
                  <label htmlFor="inv-obra" className="form-label small fw-semibold">
                    Obra de arte *
                  </label>
                  <select
                    id="inv-obra"
                    className="form-select"
                    value={formMov.obraId}
                    onChange={(e) =>
                      setFormMov({ ...formMov, obraId: Number(e.target.value) })
                    }
                  >
                    {(datos.obras || []).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.codigo} — {o.titulo} (Stock actual: {o.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label htmlFor="inv-tipo" className="form-label small fw-semibold">
                      Tipo de movimiento *
                    </label>
                    <select
                      id="inv-tipo"
                      className="form-select"
                      value={formMov.tipo}
                      onChange={(e) => setFormMov({ ...formMov, tipo: e.target.value })}
                    >
                      <option value="ENTRADA">ENTRADA (+ sumar al stock)</option>
                      <option value="SALIDA">SALIDA (- descontar stock)</option>
                      <option value="AJUSTE">AJUSTE (= fijar stock exacto)</option>
                    </select>
                  </div>
                  <div className="col-sm-6">
                    <label htmlFor="inv-cant" className="form-label small fw-semibold">
                      Cantidad *
                    </label>
                    <input
                      id="inv-cant"
                      type="number"
                      min="0"
                      className="form-control"
                      value={formMov.cantidad}
                      onChange={(e) =>
                        setFormMov({ ...formMov, cantidad: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="inv-motivo" className="form-label small fw-semibold">
                    Motivo / Justificación *
                  </label>
                  <input
                    id="inv-motivo"
                    type="text"
                    className="form-control"
                    value={formMov.motivo}
                    onChange={(e) => setFormMov({ ...formMov, motivo: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-gold w-100">
                  Aplicar movimiento en inventario
                </button>
              </form>
            </div>

            {/* Alertas de stock bajo */}
            <div className="card border-0 shadow-sm p-4 bg-soft">
              <h2 className="h5 mb-3">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2" aria-hidden="true"></i>
                Alertas de Stock Mínimo ({datos.alertasStockBajo?.length || 0})
              </h2>
              <div className="table-responsive" style={{ maxHeight: "260px" }}>
                <table className="table table-sm mb-0 bg-white">
                  <thead>
                    <tr>
                      <th>Obra</th>
                      <th>Stock</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(datos.alertasStockBajo || []).map((a) => (
                      <tr key={a.id}>
                        <td className="small">{a.titulo}</td>
                        <td className="fw-bold">{a.stock}</td>
                        <td>
                          <span
                            className={`badge ${
                              a.stock === 0 ? "bg-danger" : "bg-warning text-dark"
                            }`}
                          >
                            {a.stock === 0 ? "Agotada (0)" : "Última unidad"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Historial de movimientos */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4">
              <h2 className="h5 mb-3">Historial de Movimientos de Inventario</h2>
              <div className="table-responsive">
                <table className="table table-hover table-sm align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Obra</th>
                      <th>Tipo</th>
                      <th>Stock Ant. → Nuevo</th>
                      <th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(datos.movimientos || []).map((m) => (
                      <tr key={m.id}>
                        <td className="small">{formatearFechaES(m.fecha)}</td>
                        <td className="small fw-semibold">{m.obra?.titulo}</td>
                        <td>
                          <span
                            className={`badge ${
                              m.tipo === "ENTRADA"
                                ? "bg-success"
                                : m.tipo === "SALIDA"
                                ? "bg-danger"
                                : "bg-dark"
                            }`}
                          >
                            {m.tipo}
                          </span>
                        </td>
                        <td className="small">
                          {m.stockAnterior} → <strong>{m.stockNuevo}</strong>
                        </td>
                        <td className="small text-muted">{m.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Listado de Facturas en el Panel Admin (/admin/facturas)
 */
export const AdminFacturasPage = () => {
  const { adminSession } = useApp();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!adminSession?.token) return;
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/pedidos`, {
        headers: { Authorization: `Bearer ${adminSession.token}` },
      })
      .then((res) => {
        if (!res.err) setPedidos(res.datos || []);
        setCargando(false);
      });
  }, [adminSession]);

  if (!adminSession?.token) return <Navigate to="/admin/login" replace />;

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Admin", to: "/admin" }, { label: "Facturación" }]} />
      <AdminNav />

      <h1 className="h2 mb-3">Historial de Facturas Electrónicas Emitidas</h1>

      {cargando ? (
        <Loader texto="Cargando facturas..." />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>N.º Factura</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Medio de Pago</th>
                  <th>Subtotal</th>
                  <th>IVA (19 %)</th>
                  <th>Total</th>
                  <th className="text-end">Ver / PDF</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-bold">{p.numeroFactura}</td>
                    <td>{formatearFechaES(p.fecha)}</td>
                    <td>
                      {p.nombreCliente}
                      <div className="small text-muted">Doc: {p.documentoCliente}</div>
                    </td>
                    <td>
                      <span className="badge bg-dark">{p.metodoPago}</span>
                    </td>
                    <td>{formatearMonedaCOP(p.subtotal)}</td>
                    <td>{formatearMonedaCOP(p.iva)}</td>
                    <td className="fw-bold">{formatearMonedaCOP(p.total)}</td>
                    <td className="text-end">
                      <Link
                        to={`/pedido/${p.id}/factura`}
                        className="btn btn-outline-gold btn-sm"
                      >
                        Abrir Factura PDF
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Gestión de PQR desde el Admin (/admin/pqr)
 * Permite cambiar el estado (Radicada, En trámite, Resuelta) y registrar respuesta oficial.
 */
export const AdminPqrPage = () => {
  const { adminSession, mostrarToast } = useApp();
  const [pqrs, setPqrs] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState(null);
  const [estadoForm, setEstadoForm] = useState("En trámite");
  const [respuestaForm, setRespuestaForm] = useState("");

  const cargar = useCallback(() => {
    if (!adminSession?.token) return;
    setCargando(true);
    helpFetch()
      .get(`${EMPRESA.apiBaseUrl}/pqr`, {
        headers: { Authorization: `Bearer ${adminSession.token}` },
      })
      .then((res) => {
        if (!res.err) setPqrs(res.datos || []);
        setCargando(false);
      });
  }, [adminSession]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (!adminSession?.token) return <Navigate to="/admin/login" replace />;

  const guardarRespuesta = (e) => {
    e.preventDefault();
    if (!seleccionada) return;
    helpFetch()
      .put(`${EMPRESA.apiBaseUrl}/pqr/${seleccionada.id}`, {
        headers: { Authorization: `Bearer ${adminSession.token}` },
        body: { estado: estadoForm, respuesta: respuestaForm },
      })
      .then((res) => {
        if (!res.err) {
          mostrarToast(`PQR ${seleccionada.radicado} actualizada a ${estadoForm}.`, "success");
          setSeleccionada(null);
          cargar();
        }
      });
  };

  return (
    <div className="container py-4">
      <Breadcrumbs items={[{ label: "Admin", to: "/admin" }, { label: "Gestión PQR" }]} />
      <AdminNav />

      <h1 className="h2 mb-3">Atención y Respuesta de Solicitudes PQR</h1>

      {seleccionada && (
        <div className="card border-0 shadow-sm p-4 mb-4 bg-soft">
          <h2 className="h5 mb-3">
            Responder Radicado: <span className="text-gold">{seleccionada.radicado}</span>
          </h2>
          <form onSubmit={guardarRespuesta}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="adm-pqr-est" className="form-label small fw-semibold">
                  Nuevo estado
                </label>
                <select
                  id="adm-pqr-est"
                  className="form-select"
                  value={estadoForm}
                  onChange={(e) => setEstadoForm(e.target.value)}
                >
                  <option value="Radicada">Radicada</option>
                  <option value="En trámite">En trámite</option>
                  <option value="Resuelta">Resuelta</option>
                </select>
              </div>
              <div className="col-md-8">
                <label htmlFor="adm-pqr-resp" className="form-label small fw-semibold">
                  Respuesta oficial al ciudadano
                </label>
                <textarea
                  id="adm-pqr-resp"
                  rows="2"
                  className="form-control"
                  value={respuestaForm}
                  onChange={(e) => setRespuestaForm(e.target.value)}
                  required
                />
              </div>
              <div className="col-12 d-flex gap-2">
                <button type="submit" className="btn btn-gold btn-sm">
                  Guardar estado y respuesta
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSeleccionada(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {cargando ? (
        <Loader texto="Cargando radicados..." />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Radicado</th>
                  <th>Tipo</th>
                  <th>Solicitante</th>
                  <th>Asunto y Mensaje</th>
                  <th>Estado</th>
                  <th>Respuesta</th>
                  <th className="text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {pqrs.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold">{item.radicado}</td>
                    <td>{item.tipo}</td>
                    <td>
                      {item.nombre}
                      <div className="small text-muted">{item.correo}</div>
                    </td>
                    <td className="small">
                      <strong>{item.asunto}</strong>
                      <div className="text-muted">{item.mensaje}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.estado === "Resuelta"
                            ? "bg-success"
                            : item.estado === "En trámite"
                            ? "bg-warning text-dark"
                            : "bg-secondary"
                        }`}
                      >
                        {item.estado}
                      </span>
                    </td>
                    <td className="small">{item.respuesta || "Pendiente"}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-sm"
                        onClick={() => {
                          setSeleccionada(item);
                          setEstadoForm(item.estado);
                          setRespuestaForm(item.respuesta || "");
                        }}
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Gestor CRUD Genérico del Panel Admin (/admin/obras, /admin/artistas, /admin/cursos, /admin/exposiciones, /admin/clientes)
 * Reutiliza el mismo componente CrudApp del Laboratorio IV conectado al backend Express.
 */
export const AdminCrudEntityPage = () => {
  const { entidad } = useParams();
  const { adminSession } = useApp();
  const [subTab, setSubTab] = useState("clientes");

  if (!adminSession?.token) return <Navigate to="/admin/login" replace />;

  const headers = { Authorization: `Bearer ${adminSession.token}` };

  const configs = {
    obras: {
      title: "Catálogo de Obras de Arte",
      endpoint: `${EMPRESA.apiBaseUrl}/obras`,
      initialForm: {
        id: null,
        titulo: "",
        tecnica: "Óleo",
        estilo: "Contemporáneo",
        tamano: "Mediano",
        dimensiones: "70 x 90 cm",
        precio: 2500000,
        stock: 1,
        estado: "Disponible",
        descripcion: "",
        imagenUrl:
          "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=900&q=80",
        artistaId: 1,
        categoriaId: 1,
      },
      fields: [
        { name: "titulo", label: "Título de la Obra", required: true, colClass: "col-md-5" },
        {
          name: "tecnica",
          label: "Técnica",
          type: "select",
          required: true,
          colClass: "col-md-3",
          options: [
            { value: "Óleo", label: "Óleo" },
            { value: "Acrílico", label: "Acrílico" },
            { value: "Escultura", label: "Escultura" },
            { value: "Fotografía", label: "Fotografía" },
            { value: "Digital", label: "Digital" },
          ],
        },
        {
          name: "estilo",
          label: "Estilo",
          type: "select",
          required: true,
          colClass: "col-md-4",
          options: [
            { value: "Contemporáneo", label: "Contemporáneo" },
            { value: "Abstracto", label: "Abstracto" },
            { value: "Realismo", label: "Realismo" },
            { value: "Minimalista", label: "Minimalista" },
            { value: "Expresionista", label: "Expresionista" },
          ],
        },
        {
          name: "precio",
          label: "Precio (COP)",
          type: "number",
          required: true,
          min: 10000,
          colClass: "col-md-3",
        },
        {
          name: "stock",
          label: "Stock disponible",
          type: "number",
          required: true,
          min: 0,
          colClass: "col-md-3",
        },
        { name: "dimensiones", label: "Dimensiones", required: true, colClass: "col-md-3" },
        {
          name: "tamano",
          label: "Tamaño",
          type: "select",
          colClass: "col-md-3",
          options: [
            { value: "Pequeño", label: "Pequeño" },
            { value: "Mediano", label: "Mediano" },
            { value: "Grande", label: "Grande" },
          ],
        },
        { name: "imagenUrl", label: "URL de Imagen", colClass: "col-md-6" },
        { name: "descripcion", label: "Descripción curatorial", colClass: "col-md-6" },
      ],
      columns: [
        { key: "codigo", label: "Código" },
        { key: "titulo", label: "Título" },
        { key: "tecnica", label: "Técnica" },
        {
          key: "precio",
          label: "Precio",
          render: (v) => formatearMonedaCOP(v),
        },
        { key: "stock", label: "Stock" },
        { key: "estado", label: "Estado" },
      ],
    },
    artistas: {
      title: "Artistas Representados",
      endpoint: `${EMPRESA.apiBaseUrl}/artistas`,
      initialForm: {
        id: null,
        nombre: "",
        ciudad: "Bogotá",
        pais: "Colombia",
        estilo: "Arte Contemporáneo",
        biografia: "",
        trayectoria: "",
        correo: "",
      },
      fields: [
        { name: "nombre", label: "Nombre del Artista", required: true, colClass: "col-md-4" },
        { name: "ciudad", label: "Ciudad", required: true, colClass: "col-md-4" },
        { name: "estilo", label: "Estilo Principal", required: true, colClass: "col-md-4" },
        { name: "biografia", label: "Biografía", type: "textarea", required: true, colClass: "col-md-6" },
        { name: "trayectoria", label: "Trayectoria", type: "textarea", colClass: "col-md-6" },
      ],
      columns: [
        { key: "nombre", label: "Artista" },
        { key: "ciudad", label: "Ciudad" },
        { key: "estilo", label: "Estilo" },
        { key: "correo", label: "Correo" },
      ],
    },
    cursos: {
      title: "Cursos y Talleres",
      endpoint: `${EMPRESA.apiBaseUrl}/cursos`,
      initialForm: {
        id: null,
        titulo: "",
        tecnica: "Óleo",
        nivel: "Principiante",
        modalidad: "Presencial",
        instructor: "Valentina Restrepo",
        horario: "Sábados 9:00 a. m. - 12:00 m.",
        precio: 350000,
        cuposDisponibles: 12,
        materiales: "Kit básico incluido.",
      },
      fields: [
        { name: "titulo", label: "Título del Taller", required: true, colClass: "col-md-6" },
        {
          name: "nivel",
          label: "Nivel",
          type: "select",
          required: true,
          colClass: "col-md-3",
          options: [
            { value: "Principiante", label: "Principiante" },
            { value: "Intermedio", label: "Intermedio" },
            { value: "Avanzado", label: "Avanzado" },
          ],
        },
        {
          name: "modalidad",
          label: "Modalidad",
          type: "select",
          required: true,
          colClass: "col-md-3",
          options: [
            { value: "Presencial", label: "Presencial" },
            { value: "Virtual", label: "Virtual" },
          ],
        },
        { name: "instructor", label: "Instructor(a)", required: true, colClass: "col-md-4" },
        { name: "horario", label: "Horario", required: true, colClass: "col-md-4" },
        { name: "precio", label: "Precio (COP)", type: "number", required: true, colClass: "col-md-2" },
        {
          name: "cuposDisponibles",
          label: "Cupos",
          type: "number",
          required: true,
          colClass: "col-md-2",
        },
        { name: "materiales", label: "Materiales requeridos", colClass: "col-12" },
      ],
      columns: [
        { key: "titulo", label: "Curso / Taller" },
        { key: "nivel", label: "Nivel" },
        { key: "modalidad", label: "Modalidad" },
        { key: "instructor", label: "Instructor" },
        { key: "precio", label: "Valor", render: (v) => formatearMonedaCOP(v) },
        { key: "cuposDisponibles", label: "Cupos" },
      ],
    },
    exposiciones: {
      title: "Exposiciones y Eventos",
      endpoint: `${EMPRESA.apiBaseUrl}/exposiciones`,
      initialForm: {
        id: null,
        titulo: "",
        subtitulo: "",
        curador: "Comité Curatorial",
        sala: "Sala Principal",
        fechaInicio: "2026-12-01",
        fechaFin: "2027-01-30",
        estado: "Próximo",
        cuposDisponibles: 60,
      },
      fields: [
        { name: "titulo", label: "Título de la Exposición", required: true, colClass: "col-md-6" },
        { name: "subtitulo", label: "Subtítulo", required: true, colClass: "col-md-6" },
        { name: "curador", label: "Curador(a)", required: true, colClass: "col-md-4" },
        { name: "sala", label: "Sala", required: true, colClass: "col-md-4" },
        {
          name: "estado",
          label: "Estado",
          type: "select",
          required: true,
          colClass: "col-md-4",
          options: [
            { value: "En curso", label: "En curso" },
            { value: "Próximo", label: "Próximo" },
            { value: "Finalizado", label: "Finalizado" },
          ],
        },
        { name: "fechaInicio", label: "Fecha inicio", type: "date", colClass: "col-md-4" },
        { name: "fechaFin", label: "Fecha fin", type: "date", colClass: "col-md-4" },
        { name: "cuposDisponibles", label: "Cupos", type: "number", colClass: "col-md-4" },
      ],
      columns: [
        { key: "titulo", label: "Exposición" },
        { key: "curador", label: "Curaduría" },
        { key: "sala", label: "Sala" },
        { key: "estado", label: "Estado" },
        { key: "cuposDisponibles", label: "Cupos" },
      ],
    },
    clientes: {
      title: "Clientes Registrados",
      endpoint: `${EMPRESA.apiBaseUrl}/clientes`,
      initialForm: {
        id: null,
        nombre: "",
        documento: "",
        correo: "",
        celular: "",
        direccion: "",
        ciudad: "Bogotá",
      },
      fields: [
        { name: "nombre", label: "Nombre Completo", required: true, colClass: "col-md-4" },
        { name: "documento", label: "Documento", required: true, colClass: "col-md-4" },
        { name: "celular", label: "Celular", required: true, colClass: "col-md-4" },
        { name: "correo", label: "Correo", type: "email", required: true, colClass: "col-md-4" },
        { name: "direccion", label: "Dirección", required: true, colClass: "col-md-4" },
        { name: "ciudad", label: "Ciudad", required: true, colClass: "col-md-4" },
      ],
      columns: [
        { key: "nombre", label: "Cliente" },
        { key: "documento", label: "Documento" },
        { key: "correo", label: "Correo" },
        { key: "celular", label: "Celular" },
        { key: "ciudad", label: "Ciudad" },
      ],
    },
    proveedores: {
      title: "Proveedores e Insumos Museográficos",
      endpoint: `${EMPRESA.apiBaseUrl}/proveedores`,
      initialForm: {
        id: null,
        nombre: "",
        nit: "",
        contacto: "",
        correo: "",
        celular: "",
        insumo: "",
        ciudad: "Bogotá",
      },
      fields: [
        { name: "nombre", label: "Razón Social", required: true, colClass: "col-md-4" },
        { name: "nit", label: "NIT", required: true, colClass: "col-md-4" },
        { name: "contacto", label: "Contacto", required: true, colClass: "col-md-4" },
        { name: "correo", label: "Correo", required: true, colClass: "col-md-4" },
        { name: "celular", label: "Celular", required: true, colClass: "col-md-4" },
        { name: "insumo", label: "Insumo / Servicio", required: true, colClass: "col-md-4" },
      ],
      columns: [
        { key: "nombre", label: "Proveedor" },
        { key: "nit", label: "NIT" },
        { key: "contacto", label: "Contacto" },
        { key: "insumo", label: "Insumo" },
        { key: "celular", label: "Celular" },
      ],
    },
    categorias: {
      title: "Categorías Curatoriales",
      endpoint: `${EMPRESA.apiBaseUrl}/categorias`,
      initialForm: {
        id: null,
        nombre: "",
        descripcion: "",
        icono: "bi-palette",
      },
      fields: [
        { name: "nombre", label: "Nombre de Categoría", required: true, colClass: "col-md-4" },
        { name: "descripcion", label: "Descripción", required: true, colClass: "col-md-8" },
      ],
      columns: [
        { key: "id", label: "ID" },
        { key: "nombre", label: "Categoría" },
        { key: "slug", label: "Slug" },
        { key: "descripcion", label: "Descripción" },
      ],
    },
  };

  const claveActiva =
    entidad === "clientes" ? subTab : configs[entidad] ? entidad : "obras";
  const cfg = configs[claveActiva];

  return (
    <div className="container py-4">
      <Breadcrumbs
        items={[
          { label: "Admin", to: "/admin" },
          { label: cfg.title },
        ]}
      />
      <AdminNav />

      {entidad === "clientes" && (
        <div className="btn-group mb-4" role="group" aria-label="Alternar entre clientes, proveedores y categorías">
          <button
            type="button"
            className={`btn btn-sm ${
              subTab === "clientes" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setSubTab("clientes")}
          >
            Gestión de Clientes
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              subTab === "proveedores" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setSubTab("proveedores")}
          >
            Gestión de Proveedores
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              subTab === "categorias" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setSubTab("categorias")}
          >
            Gestión de Categorías
          </button>
        </div>
      )}

      <h1 className="h2 mb-3">CRUD Administrativo — {cfg.title}</h1>

      <CrudApp
        key={claveActiva}
        title={cfg.title}
        endpoint={cfg.endpoint}
        fields={cfg.fields}
        columns={cfg.columns}
        initialForm={cfg.initialForm}
        headers={headers}
      />
    </div>
  );
};
