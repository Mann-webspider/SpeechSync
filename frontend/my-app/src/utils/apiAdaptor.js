const API_BASE_URL =  "http://localhost:3001";

export async function apiAdapter ({
  method = "GET",
  url,
  data = null,
  params = null,
  headers = {},
})  {
  try {
    const fullUrl = new URL(`${API_BASE_URL}${url}`);
    
    // Add query parameters if present
    if (params) {
      Object.keys(params).forEach((key) =>
        fullUrl.searchParams.append(key, params[key])
      );
    }

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    // Add body data for POST/PUT requests
    if (data) {
      if (data instanceof FormData) {
        // Remove Content-Type for FormData; browser sets it automatically
        delete options.headers["Content-Type"];
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        errorResponse.message || `HTTP error ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Adapter Error:", error);
    throw error;
  }
};
