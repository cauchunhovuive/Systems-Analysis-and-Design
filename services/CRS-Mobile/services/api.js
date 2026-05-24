import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.2.133:3000/api';

const request = async (method, path, body = null) => {
  const token = await AsyncStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw { response: { data, status: res.status } };
  return { data };
};

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export default api;