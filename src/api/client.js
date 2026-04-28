import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7231";

let getAccessToken = () => null;
let refreshAccessToken = async () => false;
let onAuthFailure = () => {};
let refreshPromise = null;

export const configureApiClient = (config) => {
  getAccessToken = config.getAccessToken;
  refreshAccessToken = config.refreshAccessToken;
  onAuthFailure = config.onAuthFailure;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const toApiError = (requestError) => {
  if (!axios.isAxiosError(requestError)) {
    return requestError;
  }

  const status = requestError.response?.status ?? 0;
  const payload = requestError.response?.data ?? null;
  let message = `Request failed (${status})`;

  if (payload && typeof payload === "object") {
    if (typeof payload.message === "string") {
      message = payload.message;
    } else if (typeof payload.title === "string") {
      message = payload.title;
    }
  }

  const error = new Error(message);
  error.status = status;
  error.payload = payload;
  return error;
};

api.interceptors.request.use((config) => {
  if (config.meta?.auth === false) {
    return config;
  }

  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (requestError) => {
    if (!axios.isAxiosError(requestError)) {
      throw requestError;
    }

    const originalRequest = requestError.config;
    const status = requestError.response?.status;

    if (
      !originalRequest ||
      status !== 401 ||
      originalRequest._retry ||
      originalRequest.meta?.retryOnUnauthorized === false
    ) {
      throw toApiError(requestError);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (!refreshed) {
      onAuthFailure();
      throw toApiError(requestError);
    }

    return api.request(originalRequest);
  },
);

export const login = async ({ email, password, signal } = {}) => {
  try {
    const response = await api.post(
      "/api/auth/login",
      { email, password },
      {
        signal,
        meta: { auth: false, retryOnUnauthorized: false },
      },
    );
    return response.data ?? null;
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to login", error.message);
    throw error;
  }
};

export const refreshSession = async ({ signal } = {}) => {
  try {
    const response = await api.post("/api/auth/refresh", null, {
      signal,
      meta: { auth: false, retryOnUnauthorized: false },
    });
    return response.data ?? null;
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to refresh session", error.message);
    throw error;
  }
};

export const logout = async ({ auth = true, signal } = {}) => {
  try {
    const response = await api.post("/api/auth/logout", null, {
      signal,
      meta: { auth, retryOnUnauthorized: false },
    });
    return response.status === 204 ? null : (response.data ?? null);
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to logout", error.message);
    throw error;
  }
};

export const getCurrentUser = async ({ signal } = {}) => {
  try {
    const response = await api.get("/api/users/me", {
      signal,
      meta: { auth: true, retryOnUnauthorized: true },
    });
    return response.data ?? null;
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to load current user", error.message);
    throw error;
  }
};

export const getRisks = async ({ signal } = {}) => {
  try {
    const response = await api.get("/api/risks", {
      signal,
      meta: { auth: true, retryOnUnauthorized: true },
    });
    return response.data ?? null;
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to load risks", error.message);
    throw error;
  }
};

export const getRiskAssessments = async ({ signal } = {}) => {
  try {
    const response = await api.get("/api/risk-assessment", {
      signal,
      meta: { auth: true, retryOnUnauthorized: true },
    });
    return response.data ?? null;
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to load risk assessments", error.message);
    throw error;
  }
};

export const getIncidents = async ({ signal } = {}) => {
  try {
    const response = await api.get("/api/incidents", {
      signal,
      meta: { auth: true, retryOnUnauthorized: true },
    });
    return response.data ?? null;
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to load incidents", error.message);
    throw error;
  }
};

export const getActionPlans = async ({ signal } = {}) => {
  try {
    const response = await api.get("/api/action-plans", {
      signal,
      meta: { auth: true, retryOnUnauthorized: true },
    });
    return response.data ?? null;
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to load action plans", error.message);
    throw error;
  }
};

export const getOrganizationAuditDetails = async (
  organizationId,
  { signal } = {},
) => {
  try {
    const response = await api.get(
      `/api/organization/${organizationId}/audit-details`,
      {
        signal,
        meta: { auth: true, retryOnUnauthorized: true },
      },
    );
    return response.data ?? null;
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to load organization audit details", error.message);
    throw error;
  }
};

export const getOrganizationById = async (organizationId, { signal } = {}) => {
  try {
    const response = await api.get(`/api/organization/${organizationId}`, {
      signal,
      meta: { auth: true, retryOnUnauthorized: true },
    });
    return response.data ?? null;
  } catch (requestError) {
    const error = toApiError(requestError);
    console.error("Failed to load organization details", error.message);
    throw error;
  }
};
