import api from "./authService";

export type StaffRole = "advisor" | "verifier";
export type StaffAccount = {
  id: string;
  role: StaffRole;
  name: string;
  mobile: string;
  email?: string;
  createdAt: string;
};

export const adminService = {
  async listStaff(): Promise<StaffAccount[]> {
    const response = await api.get("/admin/staff");
    return response.data;
  },
  async createStaff(input: { role: StaffRole; name: string; mobile: string; email?: string; password: string }): Promise<StaffAccount> {
    const response = await api.post("/admin/staff", input);
    return response.data;
  },
};
