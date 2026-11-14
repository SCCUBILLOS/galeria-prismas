import React, { useState, useEffect, useCallback } from "react";
import { helpFetch } from "../../helpers/helpFetch";
import CrudForm from "./CrudForm";
import CrudTable from "./CrudTable";
import Loader from "./Loader";
import Message from "./Message";

/**
 * Componente CrudApp genérico del Laboratorio IV reutilizado en:
 * 1) /equipo (conectado a json-server en http://localhost:5000/desarrolladores)
 * 2) /admin/* (conectado al backend Express en http://localhost:4000/api/*)
 */
const CrudApp = ({
  title = "Gestión CRUD",
  endpoint,
  fields = [],
  columns = [],
  initialForm = { id: null },
  headers = {},
  customValidate,
  extractList,
  onAfterChange,
}) => {
  const [db, setDb] = useState(null);
  const [dataToEdit, setDataToEdit] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const cargarDatos = useCallback(() => {
    const api = helpFetch();
    setLoading(true);
    api.get(endpoint, { headers }).then((res) => {
      if (!res.err) {
        const list = extractList
          ? extractList(res)
          : Array.isArray(res)
          ? res
          : res.datos || res.data || [];
        setDb(list);
        setError(null);
      } else {
        setDb(null);
        setError(res);
      }
      setLoading(false);
    });
  }, [endpoint]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const showNotice = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const createData = (data) => {
    const api = helpFetch();
    const payload = { ...data };
    delete payload.id;

    api.post(endpoint, { body: payload, headers }).then((res) => {
      if (!res.err) {
        const created = res.dato || res.data || res;
        setDb((prev) => (prev ? [...prev, created] : [created]));
        setError(null);
        showNotice("Registro creado exitosamente.");
        if (onAfterChange) onAfterChange(created);
      } else {
        setError(res);
      }
    });
  };

  const updateData = (data) => {
    const api = helpFetch();
    const url = `${endpoint}/${data.id}`;
    api.put(url, { body: data, headers }).then((res) => {
      if (!res.err) {
        const updated = res.dato || res.data || res;
        setDb((prev) => prev.map((el) => (el.id === data.id ? { ...el, ...updated } : el)));
        setError(null);
        showNotice("Registro actualizado exitosamente.");
        if (onAfterChange) onAfterChange(updated);
      } else {
        setError(res);
      }
    });
  };

  const deleteData = (id, label = "") => {
    const isDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el registro "${label}" (ID: ${id})?`
    );
    if (!isDelete) return;

    const api = helpFetch();
    const url = `${endpoint}/${id}`;
    api.del(url, { headers }).then((res) => {
      if (!res.err) {
        setDb((prev) => prev.filter((el) => el.id !== id));
        setError(null);
        showNotice("Registro eliminado correctamente.");
        if (onAfterChange) onAfterChange(id);
      } else {
        setError(res);
      }
    });
  };

  return (
    <section aria-label={title}>
      {toast && (
        <div className="alert alert-success d-flex align-items-center shadow-sm" role="status">
          <i className="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
          <span>{toast}</span>
        </div>
      )}
      <CrudForm
        createData={createData}
        updateData={updateData}
        dataToEdit={dataToEdit}
        setDataToEdit={setDataToEdit}
        fields={fields}
        initialForm={initialForm}
        titleCreate={`Agregar en ${title}`}
        titleEdit={`Editar en ${title}`}
        customValidate={customValidate}
      />
      {loading && <Loader />}
      {error && (
        <Message
          msg={`Error ${error.status}: ${error.statusText}`}
          bgColor="#dc3545"
        />
      )}
      {db && (
        <CrudTable
          data={db}
          columns={columns}
          setDataToEdit={setDataToEdit}
          deleteData={deleteData}
          title={`Listado — ${title}`}
        />
      )}
    </section>
  );
};

export default CrudApp;
