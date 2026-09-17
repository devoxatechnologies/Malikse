/**
 * MalikSe — Document Service
 */
import api from "./authService";
import type { PropertyDocument, ShareLink } from "../types/document.types";

export const documentService = {
  async uploadDocument(propertyId: string, type: string, file: File | Blob, fileName: string): Promise<PropertyDocument> {
    const formData = new FormData();
    formData.append("propertyId", propertyId);
    formData.append("type", type);
    // @ts-ignore
    formData.append("file", file, fileName);

    const res = await api.post("/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  async getDocuments(propertyId: string): Promise<PropertyDocument[]> {
    const res = await api.get("/documents", { params: { propertyId } });
    return res.data;
  },

  async generateShareLink(docId: string): Promise<ShareLink> {
    const res = await api.post(`/documents/${docId}/share-link`);
    return res.data;
  }
};
