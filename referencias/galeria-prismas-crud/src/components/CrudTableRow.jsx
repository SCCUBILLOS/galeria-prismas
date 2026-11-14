import React from "react";

const CrudTableRow = ({ el, columns, setDataToEdit, deleteData }) => {
  return (
    <tr>
      {columns.map((col) => (
        <td key={col.key} className="align-middle">
          {col.render ? col.render(el[col.key], el) : String(el[col.key] ?? "—")}
        </td>
      ))}
      <td className="text-end align-middle">
        <div className="btn-group btn-group-sm" role="group" aria-label="Acciones de fila">
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={() => setDataToEdit(el)}
            title="Editar registro"
          >
            <i className="bi bi-pencil-square me-1" aria-hidden="true"></i>
            Editar
          </button>
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => deleteData(el.id, el.nombre || el.titulo || `#${el.id}`)}
            title="Eliminar registro"
          >
            <i className="bi bi-trash me-1" aria-hidden="true"></i>
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CrudTableRow;
