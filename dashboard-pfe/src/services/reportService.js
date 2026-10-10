import api from "./api";

export const reportService = {
  getAll: async () => {
    const response = await api.get("/reports/");
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/reports/", data);
    return response.data;
  }
};