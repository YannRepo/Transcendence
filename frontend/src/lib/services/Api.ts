import { goto } from "$app/navigation";
import axios from "axios";
import { PUBLIC_API_URL } from '$env/static/public';


// Create a instance of axios to use the same base url.
const axiosAPI = axios.create({
  baseURL: PUBLIC_API_URL,
  // baseURL: "http://localhost:3000", // it's not recommended to have this info here.
});

// implement a method to execute all the request from here.
const apiRequest = (method, url, request) => {
  const headers = {
    authorization: `Bearer ${localStorage.getItem(
      "access_token"
    )}, ${localStorage.getItem("refresh_token")}`,
  };
  //using the axios instance to perform the request that received from each http method
  return axiosAPI({
    method,
    url,
    data: request,
    headers,
  })
    .then((res) => {
      return Promise.resolve(res.data);
    })
    .catch((err) => {
      return Promise.reject(err);
    });
};

// function to execute the http get request
const get = (url, request = {}) => apiRequest("get", url, request);

// function to execute the http delete request
const deleteRequest = (url, request) => apiRequest("delete", url, request);

// function to execute the http post request
const post = (url, request = {}) => apiRequest("post", url, request);

// function to execute the http put request
const put = (url, request) => apiRequest("put", url, request);

// function to execute the http path request
const patch = (url, request) => apiRequest("patch", url, request);

// expose your method to other services or actions
const API = {
  get,
  delete: deleteRequest,
  post,
  put,
  patch,
};

async function getMe() {
  let user: User;

  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  if (accessToken) {
    try {
      user = await API.get("/auth/getMe");
      if (!user.user) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        goto("/auth");
      } else {
        localStorage.setItem("access_token", user.tokens.access_token);
        localStorage.setItem("refresh_token", user.tokens.refresh_token);
      }
      return user.user;
    } catch (error) {
      console.log(error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      goto("/auth");
    }
  } else {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    goto("/auth");
  }

  return null;
}

async function getUserById(userId: number) {
  return await API.get(`/user/getUserById/${userId}`);
}

async function logOut() {
  let user: User = null;

  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  if (accessToken && refreshToken) {
    try {
      user = await getMe();
      // console.log(user);
      // TODO: delete refresh token from db
      await API.post("/auth/logout");
      if (user) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
      goto("/auth");
    } catch (error) {
      console.log(error);
    }
  }
}

async function getAvatar(userId: string) {
  return await API.get(`/avatar/getAvatar/${userId}`);
}

export default API;
export { getMe, getUserById, logOut, getAvatar };
