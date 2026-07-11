import api from './api';
import type { ApiResponse } from './boatService';

export type CertificateType = string;

export type CertificateStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type ComplianceStatus = 'valid' | 'warning' | 'hidden' | 'locked';

export type CertificateScope = 'boat' | 'owner';

export type OwnerEntityType = 'individual' | 'business' | 'cooperative';

export interface CertificateTypeItem {
  id: number;
  code: string;
  nameVi: string;
  nameEn: string;
  scope?: CertificateScope | string;
  sortOrder: number;
  isActive: boolean;
}

/** Required owner doc codes — must match backend OwnerDocumentTypes validation. */
export const OWNER_DOCUMENT_TYPES = [
  'national_id',
  'transport_license',
  'business_registration',
  'residence_proof',
  'authorization_letter',
] as const;

export const OWNER_ENTITY_TYPES = [
  'individual',
  'business',
  'cooperative',
] as const;

export const REQUIRED_OWNER_DOC_TYPES_ALWAYS = [
  'national_id',
  'transport_license',
] as const;

export function getRequiredOwnerDocumentTypes(
  entityType: OwnerEntityType | string,
): string[] {
  const required: string[] = [...REQUIRED_OWNER_DOC_TYPES_ALWAYS];
  if (entityType === 'business' || entityType === 'cooperative') {
    required.push('business_registration');
  }
  return required;
}

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

export interface OwnerDocumentFormItem {
  documentType: string;
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
  getTypes: (scope?: CertificateScope) =>
    api
      .get<ApiResponse<CertificateTypeItem[]>>('/system/certificate-types', {
        params: scope ? { scope } : undefined,
      })
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
