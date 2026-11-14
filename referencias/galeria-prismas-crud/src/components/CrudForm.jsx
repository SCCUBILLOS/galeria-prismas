import React, { useState, useEffect } from "react";

/**
 * Formulario genérico reutilizable del Laboratorio IV (CrudForm)
 * Soporta esquema de campos dinámico y validación en tiempo real.
 */
const CrudForm = ({
  createData,
  updateData,
  dataToEdit,
  setDataToEdit,
  fields = [],
  initialForm = {},
  titleCreate = "Agregar Registro",
  titleEdit = "Editar Registro",
  customValidate,
}) => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (dataToEdit) {
      setForm({ ...initialForm, ...dataToEdit });
      setErrors({});
    } else {
      setForm(initialForm);
      setErrors({});
    }
  }, [dataToEdit, initialForm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : type === "number" ? (value === "" ? "" : Number(value)) : value;
    setForm({
      ...form,
      [name]: val,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    fields.forEach((f) => {
      const value = form[f.name];
      if (f.required && (value === undefined || value === null || String(value).trim() === "")) {
        newErrors[f.name] = `El campo ${f.label} es obligatorio.`;
      } else if (value && f.pattern && !new RegExp(f.pattern).test(String(value))) {
        newErrors[f.name] = f.errorMsg || `Formato inválido en ${f.label}.`;
      }
    });
    if (customValidate) {
      const extra = customValidate(form);
      Object.assign(newErrors, extra);
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (form.id === null || form.id === undefined || form.id === "") {
      createData(form);
    } else {
      updateData(form);
    }
    handleReset();
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setDataToEdit(null);
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-dark text-white py-3">
        <h3 className="h5 mb-0">{dataToEdit ? titleEdit : titleCreate}</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            {fields.map((field) => (
              <div key={field.name} className={field.colClass || "col-md-6"}>
                <label htmlFor={`crud-${field.name}`} className="form-label fw-semibold">
                  {field.label} {field.required && <span className="text-danger">*</span>}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    id={`crud-${field.name}`}
                    name={field.name}
                    rows={field.rows || 3}
                    className={`form-control ${errors[field.name] ? "is-invalid" : ""}`}
                    placeholder={field.placeholder || ""}
                    value={form[field.name] ?? ""}
                    onChange={handleChange}
                    required={field.required}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={`crud-${field.name}`}
                    name={field.name}
                    className={`form-select ${errors[field.name] ? "is-invalid" : ""}`}
                    value={form[field.name] ?? ""}
                    onChange={handleChange}
                    required={field.required}
                  >
                    <option value="">Seleccione una opción...</option>
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <div className="form-check mt-2">
                    <input
                      id={`crud-${field.name}`}
                      type="checkbox"
                      name={field.name}
                      className="form-check-input"
                      checked={Boolean(form[field.name])}
                      onChange={handleChange}
                    />
                    <label htmlFor={`crud-${field.name}`} className="form-check-label">
                      {field.placeholder || field.label}
                    </label>
                  </div>
                ) : (
                  <input
                    id={`crud-${field.name}`}
                    type={field.type || "text"}
                    name={field.name}
                    className={`form-control ${errors[field.name] ? "is-invalid" : ""}`}
                    placeholder={field.placeholder || ""}
                    value={form[field.name] ?? ""}
                    onChange={handleChange}
                    required={field.required}
                    min={field.min}
                    step={field.step}
                  />
                )}
                {errors[field.name] && (
                  <div className="invalid-feedback d-block">{errors[field.name]}</div>
                )}
              </div>
            ))}
          </div>
          <div className="d-flex gap-2 mt-4">
            <button type="submit" className="btn btn-gold">
              <i className="bi bi-check2-circle me-1" aria-hidden="true"></i>
              {dataToEdit ? "Guardar cambios" : "Crear registro"}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
              <i className="bi bi-x-circle me-1" aria-hidden="true"></i>
              Limpiar / Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrudForm;
