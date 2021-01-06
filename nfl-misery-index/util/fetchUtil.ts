const options = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
  },
};

const success = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    if (response.status === 400) {
      const res = await response.text();
      throw new Error(res);
    }
    console.log(response);
    throw new Error('An error occurred');
  }
  const data: T = await response.json();
  return data;
};

const baseUrl = 'https://ykkv08bylf.execute-api.us-east-1.amazonaws.com/dev';

export const getJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(baseUrl + url, { method: 'GET', ...options });
  return await success<T>(response);
};
