const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("token");

const request = async (path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const getHealth = () => request("/api/health");

export const authApi = {
  register: (body) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  me: () => request("/api/auth/me"),
};

export const complaintApi = {
  create: (formData) =>
    request("/api/complaints", { method: "POST", body: formData }),
  my: () => request("/api/complaints/my"),
  getById: (id) => request(`/api/complaints/${id}`),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/complaints${query ? `?${query}` : ""}`);
  },
  updateStatus: (id, body) =>
    request(`/api/complaints/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  updatePriority: (id, body) =>
    request(`/api/complaints/${id}/priority`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};

export const noticeApi = {
  getAll: () => request("/api/notices"),
  create: (body) =>
    request("/api/notices", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/api/notices/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (id) => request(`/api/notices/${id}`, { method: "DELETE" }),
};

export const dashboardApi = {
  getStats: () => request("/api/dashboard"),
};

export default API_URL;
