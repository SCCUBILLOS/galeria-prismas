import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AppContext = createContext(null);

const STORAGE_CART = "galeria_prismas_carrito_v1";
const STORAGE_FAV = "galeria_prismas_favoritos_v1";
const STORAGE_RECENT = "galeria_prismas_recientes_v1";
const STORAGE_A11Y = "galeria_prismas_accesibilidad_v1";
const STORAGE_ADMIN = "galeria_prismas_admin_session_v1";

const initialA11y = {
  escalaTexto: 100, // 90, 100, 110, 120, 130
  altoContraste: false,
  fuenteDislexia: false,
  resaltarEnlaces: false,
  pausarAnimaciones: false,
};

export const AppProvider = ({ children }) => {
  // 1. Carrito de compras
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_CART);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  // Para heurística #3 (Control y libertad: deshacer al quitar del carrito)
  const [ultimoEliminado, setUltimoEliminado] = useState(null);

  // 2. Favoritos
  const [favoritos, setFavoritos] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_FAV);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  // 3. Obras vistas recientemente (Heurística #6: Reconocer antes que recordar)
  const [vistasRecientes, setVistasRecientes] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_RECENT);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  // 4. Accesibilidad (WCAG 2.1 + punto 3A.o)
  const [accesibilidad, setAccesibilidad] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_A11Y);
      return guardado ? { ...initialA11y, ...JSON.parse(guardado) } : initialA11y;
    } catch {
      return initialA11y;
    }
  });

  // 5. Sesión de Administrador
  const [adminSession, setAdminSession] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_ADMIN);
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  // 6. Notificación Toast global (Heurística #1: Visibilidad del estado del sistema)
  const [toast, setToast] = useState(null);

  const mostrarToast = useCallback((mensaje, tipo = "success", accionDeshacer = null) => {
    setToast({ mensaje, tipo, accionDeshacer, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sincronización con localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_CART, JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    localStorage.setItem(STORAGE_FAV, JSON.stringify(favoritos));
  }, [favoritos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_RECENT, JSON.stringify(vistasRecientes));
  }, [vistasRecientes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_A11Y, JSON.stringify(accesibilidad));
    const root = document.documentElement;
    root.style.fontSize = `${accesibilidad.escalaTexto}%`;
    document.body.classList.toggle("a11y-high-contrast", accesibilidad.altoContraste);
    document.body.classList.toggle("a11y-dyslexia-font", accesibilidad.fuenteDislexia);
    document.body.classList.toggle("a11y-highlight-links", accesibilidad.resaltarEnlaces);
    document.body.classList.toggle("a11y-pause-animations", accesibilidad.pausarAnimaciones);
  }, [accesibilidad]);

  useEffect(() => {
    if (adminSession) {
      localStorage.setItem(STORAGE_ADMIN, JSON.stringify(adminSession));
    } else {
      localStorage.removeItem(STORAGE_ADMIN);
    }
  }, [adminSession]);

  // Acciones del carrito
  const agregarAlCarrito = (obra, cantidad = 1) => {
    if (!obra || obra.estado === "Vendida" || obra.stock <= 0) {
      mostrarToast(`La obra "${obra?.titulo || ""}" no tiene stock disponible.`, "danger");
      return false;
    }

    let agregado = false;
    setCarrito((prev) => {
      const existente = prev.find((item) => item.id === obra.id);
      const cantidadActual = existente ? existente.cantidad : 0;
      const nuevaCantidad = Math.min(obra.stock, cantidadActual + Number(cantidad));

      if (existente && cantidadActual >= obra.stock) {
        mostrarToast(
          `Ya tienes el máximo disponible (${obra.stock} ud.) de "${obra.titulo}" en el carrito.`,
          "warning"
        );
        return prev;
      }

      agregado = true;
      if (existente) {
        return prev.map((item) =>
          item.id === obra.id ? { ...item, cantidad: nuevaCantidad, stock: obra.stock } : item
        );
      }
      return [
        ...prev,
        {
          id: obra.id,
          titulo: obra.titulo,
          slug: obra.slug,
          precio: obra.precio,
          tecnica: obra.tecnica,
          dimensiones: obra.dimensiones,
          imagenUrl: obra.imagenUrl,
          artistaNombre: obra.artista?.nombre || obra.artistaNombre || "Artista Galería Prismas",
          stock: obra.stock,
          esUnica: obra.esUnica,
          cantidad: Math.min(obra.stock, Number(cantidad)),
        },
      ];
    });

    if (agregado) {
      mostrarToast(`"${obra.titulo}" se agregó al carrito de compras.`, "success");
    }
    return agregado;
  };

  const cambiarCantidadCarrito = (id, nuevaCantidad) => {
    const cant = Number(nuevaCantidad);
    if (cant <= 0) {
      quitarDelCarrito(id);
      return;
    }
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const limitada = Math.min(item.stock, cant);
        if (cant > item.stock) {
          mostrarToast(`Cantidad limitada al stock máximo disponible (${item.stock}).`, "warning");
        }
        return { ...item, cantidad: limitada };
      })
    );
  };

  const quitarDelCarrito = (id) => {
    const itemEliminado = carrito.find((i) => i.id === id);
    setCarrito((prev) => prev.filter((item) => item.id !== id));
    if (itemEliminado) {
      setUltimoEliminado(itemEliminado);
      mostrarToast(`Quitaste "${itemEliminado.titulo}" del carrito.`, "info", () => {
        setCarrito((prev) => [...prev, itemEliminado]);
        setUltimoEliminado(null);
      });
    }
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const subtotalCarrito = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const ivaCarrito = Math.round(subtotalCarrito * 0.19);
  const totalCarrito = subtotalCarrito + ivaCarrito;
  const totalUnidadesCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  // Acciones de favoritos
  const esFavorito = (obraId) => favoritos.some((f) => f.id === obraId);

  const toggleFavorito = (obra) => {
    const existe = esFavorito(obra.id);
    if (existe) {
      setFavoritos((prev) => prev.filter((f) => f.id !== obra.id));
      mostrarToast(`"${obra.titulo}" se quitó de tus favoritos.`, "secondary");
    } else {
      setFavoritos((prev) => [
        ...prev,
        {
          id: obra.id,
          titulo: obra.titulo,
          slug: obra.slug,
          precio: obra.precio,
          tecnica: obra.tecnica,
          dimensiones: obra.dimensiones,
          estado: obra.estado,
          stock: obra.stock,
          imagenUrl: obra.imagenUrl,
          artista: obra.artista,
        },
      ]);
      mostrarToast(`"${obra.titulo}" se añadió a tus favoritos.`, "success");
    }
  };

  // Registrar obra vista recientemente
  const registrarVistaReciente = useCallback((obra) => {
    if (!obra || !obra.id) return;
    setVistasRecientes((prev) => {
      const filtradas = prev.filter((item) => item.id !== obra.id);
      return [
        {
          id: obra.id,
          titulo: obra.titulo,
          slug: obra.slug,
          precio: obra.precio,
          tecnica: obra.tecnica,
          imagenUrl: obra.imagenUrl,
          artistaNombre: obra.artista?.nombre || "",
        },
        ...filtradas,
      ].slice(0, 5);
    });
  }, []);

  // Controles de accesibilidad
  const aumentarTexto = () =>
    setAccesibilidad((prev) => ({
      ...prev,
      escalaTexto: Math.min(130, prev.escalaTexto + 10),
    }));

  const disminuirTexto = () =>
    setAccesibilidad((prev) => ({
      ...prev,
      escalaTexto: Math.max(90, prev.escalaTexto - 10),
    }));

  const toggleOpcionAccesibilidad = (clave) =>
    setAccesibilidad((prev) => ({
      ...prev,
      [clave]: !prev[clave],
    }));

  const restablecerAccesibilidad = () => setAccesibilidad(initialA11y);

  const iniciarSesionAdmin = (datos) => {
    setAdminSession(datos);
    mostrarToast(`Bienvenido(a), ${datos.usuario?.nombre || "Administrador"}.`, "success");
  };

  const cerrarSesionAdmin = () => {
    setAdminSession(null);
    mostrarToast("Sesión de administrador cerrada.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        cambiarCantidadCarrito,
        quitarDelCarrito,
        vaciarCarrito,
        ultimoEliminado,
        subtotalCarrito,
        ivaCarrito,
        totalCarrito,
        totalUnidadesCarrito,
        favoritos,
        esFavorito,
        toggleFavorito,
        vistasRecientes,
        registrarVistaReciente,
        accesibilidad,
        aumentarTexto,
        disminuirTexto,
        toggleOpcionAccesibilidad,
        restablecerAccesibilidad,
        adminSession,
        iniciarSesionAdmin,
        cerrarSesionAdmin,
        toast,
        setToast,
        mostrarToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de un AppProvider");
  return ctx;
};
