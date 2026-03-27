import { WIP_BASE_URL, WIP_API_KEY, WIP_IDS } from '@/constants/wipConfig';
import {
  WipBusinessUnitsResponse,
  WipCreateServicePayload,
  WipServiceDetail,
  WipSearchPayload,
  WipSearchResponse,
  WipSubscription,
  WipSubscriptionConsumption,
  WipSubscriptionConsumptionPayload,
} from '@/types/wip';

const headers = {
  Authorization: WIP_API_KEY,
  'Content-Type': 'application/json',
};

async function handleResponse<T>(response: Response): Promise<T> {
  console.log('[WipAPI] Response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    console.error('[WipAPI] Error response:', errorText);
    throw new Error(`Wip API error (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  console.log('[WipAPI] Response data:', JSON.stringify(data).substring(0, 500));
  return data as T;
}

export async function getBusinessUnits(): Promise<WipBusinessUnitsResponse> {
  console.log('[WipAPI] Fetching business units for company:', WIP_IDS.companyId);
  const url = `${WIP_BASE_URL}/business/api/v1/BusinessUnit/company/${WIP_IDS.companyId}/business-units/services`;
  const response = await fetch(url, { method: 'GET', headers });
  return handleResponse<WipBusinessUnitsResponse>(response);
}

export async function createService(
  payload: WipCreateServicePayload
): Promise<WipServiceDetail> {
  console.log('[WipAPI] Creating service:', payload.type);
  const url = `${WIP_BASE_URL}/service/api/v2/Service/${WIP_IDS.companyId}/service/${WIP_IDS.userId}`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<WipServiceDetail>(response);
}

export async function getServiceById(serviceId: string): Promise<WipServiceDetail> {
  console.log('[WipAPI] Fetching service by id:', serviceId);
  const url = `${WIP_BASE_URL}/service/api/v1/Service/${serviceId}`;
  const response = await fetch(url, { method: 'GET', headers });
  return handleResponse<WipServiceDetail>(response);
}

export async function searchServices(
  payload: WipSearchPayload
): Promise<WipSearchResponse> {
  console.log('[WipAPI] Searching services:', payload.subject);
  const url = `${WIP_BASE_URL}/service/api/v1/Service/search`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<WipSearchResponse>(response);
}

export async function getSubscriptions(
  businessUnitId: string,
  searchTerm: string
): Promise<WipSubscription[]> {
  console.log('[WipAPI] Fetching subscriptions for:', searchTerm);
  const url = `${WIP_BASE_URL}/Customer/api/v1/Customer/Subscription?companyId=${WIP_IDS.companyId}&businessUnitId=${businessUnitId}&searchTerm=${encodeURIComponent(searchTerm)}`;
  const response = await fetch(url, { method: 'GET', headers });
  return handleResponse<WipSubscription[]>(response);
}

export async function getSubscriptionConsumption(
  payload: WipSubscriptionConsumptionPayload
): Promise<WipSubscriptionConsumption> {
  console.log('[WipAPI] Fetching subscription consumption:', payload.customerId);
  const url = `${WIP_BASE_URL}/Customer/api/v1/Customer/Subscription/Consumption`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  return handleResponse<WipSubscriptionConsumption>(response);
}

export function buildCreateServicePayload(params: {
  businessUnitId: string;
  businessUnitName: string;
  serviceTypeName: string;
  formId: string;
  companyFormId: string;
  userName: string;
  userPhone: string;
  finalClientName: string;
  customerDocument: string;
  fromAddress: string;
  fromCity: string;
  toAddress: string;
  toCity: string;
  scheduledDate: string;
  note: string;
  plate?: string;
  fields?: Record<string, string>;
}): WipCreateServicePayload {
  return {
    owner: {
      id: WIP_IDS.ownerId,
      name: WIP_IDS.ownerName,
      type: 'Owner',
    },
    expedient: '',
    userName: params.userName,
    userPhone: params.userPhone,
    businessUnitId: params.businessUnitId,
    businessUnitName: params.businessUnitName,
    plate: params.plate ?? '',
    finalClientName: params.finalClientName,
    whereTo: {
      address: params.toAddress,
      otherInfo: '',
      city: params.toCity,
    },
    fromWhere: {
      address: params.fromAddress,
      otherInfo: '',
      city: params.fromCity,
    },
    userClientePhone: params.userPhone,
    customerDocument: params.customerDocument,
    scheduledDate: params.scheduledDate,
    type: params.serviceTypeName,
    note: params.note,
    customerId: null,
    automaticCalculation: true,
    fields: params.fields ?? {},
    formId: params.formId,
    companyFormId: params.companyFormId,
    creatorUser: {
      id: WIP_IDS.userId,
      name: params.userName,
    },
    buOwner: {
      id: WIP_IDS.buOwnerId,
      name: WIP_IDS.buOwnerName,
      type: 'BuOwner',
    },
  };
}

export function mapWipStatusToLocal(
  wipStatus: string
): 'solicitado' | 'validando' | 'proveedor_asignado' | 'en_camino' | 'completado' | 'cancelado' {
  switch (wipStatus) {
    case 'Pending':
      return 'solicitado';
    case 'Accepted':
      return 'validando';
    case 'InRoute':
      return 'en_camino';
    case 'InService':
      return 'proveedor_asignado';
    case 'Finished':
      return 'completado';
    case 'Cancelled':
    case 'Rejected':
      return 'cancelado';
    default:
      return 'solicitado';
  }
}

export function mapLocalStatusToWip(
  localStatus: string
): string {
  switch (localStatus) {
    case 'solicitado':
      return 'Pending';
    case 'validando':
      return 'Accepted';
    case 'proveedor_asignado':
      return 'InService';
    case 'en_camino':
      return 'InRoute';
    case 'completado':
      return 'Finished';
    case 'cancelado':
      return 'Cancelled';
    default:
      return 'Pending';
  }
}
