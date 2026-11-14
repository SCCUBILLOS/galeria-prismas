/**
 * Helper genérico para peticiones HTTP con Fetch API y AbortController.
 * Reutilizado del Laboratorio IV y adaptado para soportar cabeceras de autenticación.
 */
export const helpFetch = () => {
  const customFetch = (endpoint, options = {}) => {
    const defaultHeader = {
      accept: "application/json",
    };

    const controller = new AbortController();
    options.signal = controller.signal;

    options.method = options.method || "GET";
    options.headers = options.headers
      ? { ...defaultHeader, ...options.headers }
      : defaultHeader;

    if (options.body) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    } else {
      delete options.body;
    }

    setTimeout(() => controller.abort(), 8000);

    return fetch(endpoint, options)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return Promise.reject({
            err: true,
            status: res.status || "00",
            statusText: data.mensaje || data.error || res.statusText || "Ocurrió un error en la petición",
            errores: data.errores || [],
          });
        }
        return data;
      })
      .catch((err) => {
        if (err.err) return err;
        return {
          err: true,
          status: "00",
          statusText: err.name === "AbortError" ? "Tiempo de espera agotado (AbortController)" : (err.message || "Error de conexión con el servidor"),
        };
      });
  };

  const get = (url, options = {}) => customFetch(url, options);

  const post = (url, options = {}) => {
    options.method = "POST";
    return customFetch(url, options);
  };

  const put = (url, options = {}) => {
    options.method = "PUT";
    return customFetch(url, options);
  };

  const del = (url, options = {}) => {
    options.method = "DELETE";
    return customFetch(url, options);
  };

  return {
    get,
    post,
    put,
    del,
  };
};
