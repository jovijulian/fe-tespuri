import axios, { AxiosResponse } from "axios";
import toast from "react-hot-toast";
import { deleteCookie } from "cookies-next";

axios.defaults.withCredentials = false;

const config = {
  timeout: 60000,
};

export function endpointUrl(url = ""): string {
  const envBase = (typeof process !== "undefined" && process.env?.BASE_URL)
    ? process.env.BASE_URL
    : ((import.meta as any).env?.VITE_API_URL || "https://tes.reeval.tech/api/v1/");

  const sanitizedBase = envBase.endsWith("/") ? envBase : `${envBase}/`;
  return `${sanitizedBase}${url.toString().replace(/^\//g, "")}`;
}

export function endpointUrlv2(url = ""): string {
  const envBaseDev = (typeof process !== "undefined" && process.env?.BASE_URL_DEV)
    ? process.env.BASE_URL_DEV
    : ((import.meta as any).env?.VITE_API_URL || "https://tes.reeval.tech/api/v1/");

  const sanitizedBase = envBaseDev.endsWith("/") ? envBaseDev : `${envBaseDev}/`;
  return `${sanitizedBase}${url.toString().replace(/^\//g, "")}`;
}

export function endpointUrlv2Cetak(url = "", appendToken = false): string {
  const envBaseV2 = (typeof process !== "undefined" && process.env?.BASE_URL_V2)
    ? process.env.BASE_URL_V2
    : ((import.meta as any).env?.VITE_API_URL || "https://tes.reeval.tech/api/v1/");

  const sanitizedBase = envBaseV2.endsWith("/") ? envBaseV2 : `${envBaseV2}/`;
  let fullUrl = `${sanitizedBase}${url.toString().replace(/^\//g, "")}`;
  if (appendToken) {
    const token = localStorage.getItem("token");
    fullUrl += `${url.includes("?") ? "&" : "?"}token=${token}`;
  }
  return fullUrl;
}

const axiosInstance = axios.create(config);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isTokenExpired = error?.response?.status === 401;
    const isAuthRequest =
      error?.config?.url?.includes("auth/login") ||
      error?.config?.url?.includes("auth/change-password");

    if (isTokenExpired && !isAuthRequest) {
      toast.error("Session has expired. Please log back in.");
      localStorage.clear();
      deleteCookie("cookieKey");
      deleteCookie("role");
      window.location.href = "/signin";
      document.cookie =
        "cookieKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      return;
    }

    if (error.response && [301, 302].includes(error.response.status)) {
      const redirectUrl = error.response.headers.location;
      return axiosInstance.get(redirectUrl);
    }
    return Promise.reject(error);
  }
);

function httpGet<T = any>(url: string, withAuth = false, params = {}, configs = {}): Promise<AxiosResponse<T>> {
  if (withAuth) {
    axiosInstance.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
  return axiosInstance.get<T>(url, {
    ...{ ...config, ...configs },
    params,
  });
}

function httpGetV2<T>(
  url: string,
  withAuth = false,
  params: { [key: string]: any } = {},
  configs: { [key: string]: any } = {}
): Promise<AxiosResponse<T, any>> {
  if (withAuth) {
    axiosInstance.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
  return axiosInstance.get<T>(url, {
    ...{ ...config, ...configs },
    params,
  });
}

const httpPost = <T = any>(url: string, data: any, withAuth = false, configs = {}): Promise<AxiosResponse<T>> => {
  if (withAuth) {
    axiosInstance.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
  return axiosInstance.post<T>(url, data, {
    ...{ ...config, ...configs },
  });
};

const httpPut = <T = any>(url: string, data: any, withAuth = false, configs = {}): Promise<AxiosResponse<T>> => {
  if (withAuth) {
    axiosInstance.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
  return axiosInstance.put<T>(url, data, {
    ...{ ...config, ...configs },
  });
};

export const httpPutV2 = async <T = any>(url: string, withAuth = false, data = {}): Promise<AxiosResponse<T>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (withAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return axios.put<T>(url, data, { headers });
};

const httpPatch = <T = any>(url: string, data: any, withAuth = false, configs = {}): Promise<AxiosResponse<T>> => {
  if (withAuth) {
    axiosInstance.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
  return axiosInstance.patch<T>(url, data, {
    ...{ ...config, ...configs },
  });
};

function httpDelete<T = any>(url: string, withAuth = false, params = {}, configs = {}): Promise<AxiosResponse<T>> {
  if (withAuth) {
    axiosInstance.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("token");
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
  return axiosInstance.delete<T>(url, {
    ...{ ...config, ...configs },
    params,
  });
}

const redirectAuth = (redirecting = false) => {
  const redirectDest = "/signin";
  if (redirecting) {
    window.location.href = redirectDest;
  }
};

export default axiosInstance;
export {
  httpGet,
  httpGetV2,
  httpPut,
  httpPatch,
  httpPost,
  httpDelete,
  redirectAuth,
};
