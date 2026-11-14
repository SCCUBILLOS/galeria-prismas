/**
 * Helper genérico helpFetch reutilizado del Laboratorio IV.
 * Soporta métodos GET, POST, PUT, DELETE con AbortController.
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

    const timeoutId = setTimeout(() => controller.abort(), 10000);

    return fetch(endpoint, options)
      .then(async (res) => {
        clearTimeout(timeoutId);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return Promise.reject({
            err: true,
            status: res.status || "00",
            statusText:
              data.mensaje ||
              data.error ||
              res.statusText ||
              "Ocurrió un error al procesar la solicitud",
            errores: data.errores || [],
          });
        }
        return data;
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err && err.err) return err;
        return {
          err: true,
          status: "00",
          statusText:
            err.name === "AbortError"
              ? "Tiempo de espera agotado en la conexión"
              : err.message || "No fue posible conectar con el servidor",
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
