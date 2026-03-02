export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  avatar?: string;
  role: 'user' | 'company_admin';
  planId: string;
  companyId?: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  type: 'individual' | 'familiar' | 'corporate';
  price: number;
  currency: string;
  benefits: string[];
  maxBeneficiaries: number;
  isActive: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  servicesCount: number;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  coverageDetails: string;
  isAvailable24_7: boolean;
  serviceType: 'virtual' | 'telefónico' | 'presencial';
  imageUrl: string;
  estimatedTime?: string;
  price?: number;
}

export interface AssistanceRequest {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  status: 'solicitado' | 'validando' | 'proveedor_asignado' | 'en_camino' | 'completado' | 'cancelado';
  location: string;
  description: string;
  schedule: string;
  providerName?: string;
  providerPhone?: string;
  estimatedArrival?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  documentNumber: string;
}

export type RequestStatus = AssistanceRequest['status'];
