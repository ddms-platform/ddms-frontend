import api from './api';
import type { ApiResponse } from './boatService';

export interface OwnerDocumentListItem {
  id: string;
  documentType: string;
  documentUrl: string;
  expiryDate?: string | null;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerDocumentsOverviewResponse {
  documents: OwnerDocumentListItem[];
  ownerSince?: string | null;
  uploadDeadline?: string | null;
  isExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  isCompleted: boolean;
  isPendingReview?: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
  isLocked?: boolean;
  entityType: string;
  requiredDocumentTypes: string[];
  missingRequiredTypes: string[];
}

export const ownerDocumentService = {
  getOverview: () =>
    api
      .get<ApiResponse<OwnerDocumentsOverviewResponse>>('/owner/documents')
      .then((r) => r.data.result),

  list: () =>
    api
      .get<
        ApiResponse<OwnerDocumentsOverviewResponse | OwnerDocumentListItem[]>
      >('/owner/documents')
      .then((r) => {
        const res = r.data.result;
        if (Array.isArray(res)) return res;
        return res?.documents || [];
      }),

  uploadOrReplace: (documentType: string, file: File, expiryDate?: string) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);
    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }
    return api
      .post<ApiResponse<OwnerDocumentListItem>>('/owner/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.result);
  },
};
