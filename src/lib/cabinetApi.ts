const URL_API = 'https://functions.poehali.dev/2b89eb47-7f69-457b-bc3f-8933b14e8f9e';
const TOKEN_KEY = 'cabinet_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const callCabinet = async (body: Record<string, unknown>) => {
  const res = await fetch(URL_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
};
