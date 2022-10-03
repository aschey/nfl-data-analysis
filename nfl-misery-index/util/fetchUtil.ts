const options = {
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json;charset=UTF-8",
  },
};

const success = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    if (response.status === 400) {
      const res = await response.text();
      throw new Error(res);
    }

    throw new Error("An error occurred");
  }

  const data: T = await response.json();
  return data;
};

const baseUrl = "/nfl/api";

export const getJson = async <T>(
  url: string,
  overrideBaseUrl: string = undefined,
): Promise<T> => {
  const response = await fetch((overrideBaseUrl ?? baseUrl) + url, {
    method: "GET",
    ...options,
  });
  return success<T>(response);
};
