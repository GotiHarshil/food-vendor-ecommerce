const baseHeaders = {
  "X-Requested-With": "XMLHttpRequest",
  Accept: "application/json",
};

async function request(url, options = {}) {
  const opts = {
    credentials: "include",
    ...options,
    headers: {
      ...baseHeaders,
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  };

  if (
    opts.body &&
    typeof opts.body === "object" &&
    !(opts.body instanceof FormData) &&
    !(opts.body instanceof URLSearchParams)
  ) {
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, opts);
  const isJson = (res.headers.get("content-type") || "").includes(
    "application/json"
  );
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const err = new Error(
      (data && (data.error || data.message)) || `Request failed (${res.status})`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (url) => request(url),
  post: (url, body) => request(url, { method: "POST", body }),
  del: (url) => request(url, { method: "DELETE" }),
};

export const endpoints = {
  menu: "/api/food/menu",
  cart: "/api/food/cart",
  cartAdd: (id) => `/api/food/cart/add/${id}`,
  cartUpdate: (id) => `/api/food/cart/update/${id}`,
  cartRemove: (id) => `/api/food/cart/remove/${id}`,
  status: "/api/user/status",
  loginAPI: "/api/user/login",
  signupAPI: "/api/user/signup",
  logoutAPI: "/api/user/logout",
};
