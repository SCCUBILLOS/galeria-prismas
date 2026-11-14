import React from "react";
import CrudTableRow from "./CrudTableRow";

const CrudTable = ({ data = [], columns = [], setDataToEdit, deleteData, title = "Registros actuales" }) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
        <h3 className="h5 mb-0">{title}</h3>
        <span className="badge bg-dark">{data.length} registros</span>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col">
                  {col.label}
                </th>
              ))}
              <th scope="col" className="text-end">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((el) => (
                <CrudTableRow
                  key={el.id}
                  el={el}
                  columns={columns}
                  setDataToEdit={setDataToEdit}
                  deleteData={deleteData}
                />
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-4 text-muted">
                  Sin datos para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CrudTable;
