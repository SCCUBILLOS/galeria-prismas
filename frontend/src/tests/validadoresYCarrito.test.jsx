import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  validarCelularColombiano,
  validarCorreo,
  validarDocumento,
  validarNombre,
  validarLuhn,
  validarFechaVencimientoFutura,
  validarCVV,
} from "../utils/validadores";
import { AppProvider, useApp } from "../context/AppContext";

const CarritoTestHarness = () => {
  const {
    carrito,
    agregarAlCarrito,
    cambiarCantidadCarrito,
    subtotalCarrito,
    ivaCarrito,
    totalCarrito,
  } = useApp();

  const obraDemo = {
    id: 99,
    titulo: "Obra Prueba Vitest",
    slug: "obra-prueba-vitest",
    precio: 1000000,
    tecnica: "Óleo",
    dimensiones: "50 x 50 cm",
    imagenUrl: "/logo.svg",
    stock: 2,
    estado: "Disponible",
  };

  return (
    <div>
      <button onClick={() => agregarAlCarrito(obraDemo, 1)}>Agregar Obra</button>
      <button onClick={() => cambiarCantidadCarrito(99, 5)}>Intentar Exceder Stock</button>
      <div data-testid="unidades">{carrito[0]?.cantidad || 0}</div>
      <div data-testid="subtotal">{subtotalCarrito}</div>
      <div data-testid="iva">{ivaCarrito}</div>
      <div data-testid="total">{totalCarrito}</div>
    </div>
  );
};

describe("Validadores Frontend y Carrito de Compras (Vitest + Testing Library)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("valida celular colombiano con regex ^3\\d{9}$", () => {
    expect(validarCelularColombiano("3001234567")).toBe(true);
    expect(validarCelularColombiano("3154829103")).toBe(true);
    expect(validarCelularColombiano("2001234567")).toBe(false);
    expect(validarCelularColombiano("30012345")).toBe(false);
  });

  it("valida correo electrónico, documento y nombre", () => {
    expect(validarCorreo("sara-cardenasc@unilibre.edu.co")).toBe(true);
    expect(validarCorreo("correo-invalido")).toBe(false);

    expect(validarDocumento("1020765432")).toBe(true);
    expect(validarDocumento("1234")).toBe(false);

    expect(validarNombre("Sara Cárdenas Cubillos")).toBe(true);
    expect(validarNombre("Sara 123")).toBe(false);
  });

  it("valida tarjeta con algoritmo de Luhn, fecha futura y CVV", () => {
    expect(validarLuhn("4242424242424242")).toBe(true);
    expect(validarLuhn("4000000000000002")).toBe(true);
    expect(validarLuhn("4111111111111111")).toBe(true);
    expect(validarLuhn("4242424242424241")).toBe(false);

    expect(validarFechaVencimientoFutura("12/29")).toBe(true);
    expect(validarFechaVencimientoFutura("01/20")).toBe(false);

    expect(validarCVV("842")).toBe(true);
    expect(validarCVV("12")).toBe(false);
  });

  it("calcula subtotal, IVA 19 % y limita cantidad al stock disponible en el carrito", () => {
    render(
      <AppProvider>
        <CarritoTestHarness />
      </AppProvider>
    );

    fireEvent.click(screen.getByText("Agregar Obra"));
    expect(screen.getByTestId("unidades").textContent).toBe("1");
    expect(screen.getByTestId("subtotal").textContent).toBe("1000000");
    expect(screen.getByTestId("iva").textContent).toBe("190000");
    expect(screen.getByTestId("total").textContent).toBe("1190000");

    // Intentar poner 5 unidades cuando el stock es 2 debe limitar a 2
    fireEvent.click(screen.getByTestId ? screen.getByText("Intentar Exceder Stock") : null);
    expect(screen.getByTestId("unidades").textContent).toBe("2");
    expect(screen.getByTestId("subtotal").textContent).toBe("2000000");
  });
});
