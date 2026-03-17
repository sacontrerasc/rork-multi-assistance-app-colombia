export interface WipBusinessUnit {
  id: string;
  name: string;
  serviceTypes: WipServiceType[];
}

export interface WipServiceType {
  name: string;
  formId: string;
  companyFormId: string;
}

export interface WipBusinessUnitsResponse {
  businessUnits: WipBusinessUnit[];
}

export interface WipOwner {
  id: string;
  name: string;
  type: string;
}

export interface WipLocation {
  address: string;
  otherInfo: string;
  city: string;
}

export interface WipCreatorUser {
  id: string;
  name: string;
}

export interface WipCreateServicePayload {
  owner: WipOwner;
  expedient: string;
  userName: string;
  userPhone: string;
  businessUnitId: string;
  businessUnitName: string;
  plate: string;
  finalClientName: string;
  whereTo: WipLocation;
  fromWhere: WipLocation;
  userClientePhone: string;
  customerDocument: string;
  scheduledDate: string;
  type: string;
  note: string;
  customerId: string | null;
  automaticCalculation: boolean;
  fields: Record<string, string>;
  formId: string;
  companyFormId: string;
  creatorUser: WipCreatorUser;
  buOwner: WipOwner;
}

export interface WipServiceRecord {
  date: string;
  userId: string;
  usermName: string;
  description: string;
}

export interface WipJourneyPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface WipServiceDetail {
  id: string;
  createdDate: string;
  updateDate: string;
  expedient: string;
  userName: string;
  userPhone: string;
  userClientePhone: string;
  finalClientName: string;
  customerDocument: string;
  record: WipServiceRecord[];
  plate: string;
  price: number;
  status: WipServiceStatus;
  serviceTime: string;
  provision: {
    current: { time: string; km: number };
    estimated: { time: string; km: number };
  };
  serviceTimeTracking: {
    supplierAcceptanceDate: string;
    supplierAcceptanceTime: string;
    collaboratorAcceptanceDate: string;
    collaboratorAcceptanceTime: string;
  };
  acceptServiceDate: string;
  inServiceDate: string;
  startServiceDate: string;
  finishServiceDate: string;
  responsible: string;
  trafficStatus: string;
  trafficDate: string;
  scheduledDate: string;
  serviceUrgency: string;
  type: string;
  businessUnitId: string;
  businessUnitName: string;
  formId: string;
  companyFormId: string;
  buOwner: WipOwner & { nif: string; lastAssignment: string; reAssignment: boolean };
  owner: WipOwner & { nif: string; lastAssignment: string; reAssignment: boolean };
  creatorUser: WipCreatorUser;
  supplier: WipOwner & { nif: string; lastAssignment: string; reAssignment: boolean } | null;
  client: WipOwner & { nif: string; lastAssignment: string; reAssignment: boolean } | null;
  collaborator: WipOwner & { nif: string; lastAssignment: string; reAssignment: boolean } | null;
  fromWhere: WipLocation & { lat: string; lon: string };
  whereTo: WipLocation & { lat: string; lon: string };
  management: string;
  journeyRoute: {
    startingPoint: WipJourneyPoint;
    originAddress: WipJourneyPoint;
    endAddress: WipJourneyPoint;
    originCity: string;
    destinationCity: string;
  };
  automaticAssignment: {
    groupId: string;
    automaticAssignmentType: string;
    hasAutomaticAssignment: boolean;
  };
  url: string;
  hasQualification: boolean;
  isMultimedia: boolean;
  baseValue: number;
  totalValue: number;
  automaticCalculation: boolean;
  note: string;
  fields: Record<string, string>;
  wipExpedient: string;
}

export type WipServiceStatus =
  | 'Pending'
  | 'Accepted'
  | 'InRoute'
  | 'InService'
  | 'Finished'
  | 'Cancelled'
  | 'Rejected';

export interface WipSearchPayload {
  pageSize: number;
  page: number;
  sort: string;
  sortDirection: string;
  businessUnitId?: string;
  companyId?: string;
  userId?: string;
  subject?: string;
}

export interface WipSearchResponse {
  pageSize: number;
  page: number;
  sort: string;
  sortDirection: string;
  pagesQuantity: number;
  totalRows: number;
  data: WipServiceDetail[];
}

export interface WipSubscription {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  phone: string;
  email: string;
  documentId: string;
  plate: string;
  companyId: string;
  businessUnitIds: string[];
  address1: string;
  location1: string;
  address2: string;
  location2: string;
  originFile: string;
  additionalData: Record<string, string>;
}

export interface WipSubscriptionConsumptionPayload {
  customerId: string;
  businessUnitId: string;
  timeZone: string;
  companyId: string;
}

export interface WipSubscriptionConsumption {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  businessUnitId: string;
  companyId: string;
  code: string;
  typeServices: {
    id: string;
    name: string;
    enabled: boolean;
    serviceLimit: number;
    baseValue: number;
    consumption: number;
    availability: boolean;
  }[];
}

export interface WipWebhookPayload {
  id: string;
  expedient: string;
  wipExpedient: string;
  plate: string;
  finalClientName: string;
  customerDocument: string;
  userClientePhone: string;
  type: string;
  status: string;
}
