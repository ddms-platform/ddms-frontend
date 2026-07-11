import api from './api';
import type { ApiResponse } from './boatService';

export type CertificateType = string;

export type CertificateStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type ComplianceStatus = 'valid' | 'warning' | 'hidden' | 'locked';

export interface CertificateTypeItem {
  id: number;
  code: string;
  nameVi: string;
  nameEn: string;
  sortOrder: number;
  isActive: boolean;
}

/** Fallback when API has not loaded yet */
export const CERTIFICATE_TYPES = [
  'registration',
  'insurance',
  'business_license',
  'safety_cert',
  'other',
] as const;

export interface Certificate {
  id: string;
  boatId: string;
  certificateType: CertificateType | string;
  documentUrl: string;
  publicId?: string;
  expiryDate: string;
  status: CertificateStatus | string;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateFormItem {
  certificateType: string;
  file: File | null;
  expiryDate: string;
}

export interface OwnerCertificateListItem {
  id: string;
  boatId: string;
  boatName: string;
  ownerName?: string;
  certificateType: CertificateType | string;
  documentUrl: string;
  expiryDate: string;
  status: CertificateStatus | string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const certificateService = {
  getTypes: () =>
    api
      .get<ApiResponse<CertificateTypeItem[]>>('/system/certificate-types')
      .then((r) => r.data.result),

  getByBoatId: (boatId: string) =>
    api
      .get<ApiResponse<Certificate[]>>(`/owner/boats/${boatId}/certificates`)
      .then((r) => r.data.result),

  getAllForOwner: () =>
    api
      .get<ApiResponse<OwnerCertificateListItem[]>>('/owner/boats/certificates')
      .then((r) => r.data.result),

  upload: (
    boatId: string,
    certificateType: string,
    file: File,
    expiryDate: string,
  ) => {
    const formData = new FormData();
    formData.append('certificateType', certificateType);
    formData.append('file', file);
    formData.append('expiryDate', expiryDate);
    return api
      .post<
        ApiResponse<Certificate>
      >(`/owner/boats/${boatId}/certificates`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.result);
  },

  renew: (boatId: string, certId: string, file: File, expiryDate: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expiryDate', expiryDate);
    return api
      .post<
        ApiResponse<Certificate>
      >(`/owner/boats/${boatId}/certificates/${certId}/renew`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.result);
  },
};
