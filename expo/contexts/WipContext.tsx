import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import {
  getBusinessUnits,
  createService,
  getServiceById,
  searchServices,
  getSubscriptions,
  getSubscriptionConsumption,
  buildCreateServicePayload,
  mapWipStatusToLocal,
} from '@/services/wipApi';
import { WIP_IDS } from '@/constants/wipConfig';
import { WipBusinessUnit, WipServiceType } from '@/types/wip';

export const [WipProvider, useWip] = createContextHook(() => {
  const queryClient = useQueryClient();

  const businessUnitsQuery = useQuery({
    queryKey: ['wip', 'businessUnits'],
    queryFn: getBusinessUnits,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });

  const businessUnits: WipBusinessUnit[] = useMemo(
    () => businessUnitsQuery.data?.businessUnits ?? [],
    [businessUnitsQuery.data]
  );

  const allServiceTypes = useMemo(() => businessUnits.flatMap(bu =>
    bu.serviceTypes.map(st => ({
      ...st,
      businessUnitId: bu.id,
      businessUnitName: bu.name,
    }))
  ), [businessUnits]);

  const createServiceMutation = useMutation({
    mutationFn: (params: {
      businessUnitId: string;
      businessUnitName: string;
      serviceType: WipServiceType;
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
    }) => {
      const payload = buildCreateServicePayload({
        businessUnitId: params.businessUnitId,
        businessUnitName: params.businessUnitName,
        serviceTypeName: params.serviceType.name,
        formId: params.serviceType.formId,
        companyFormId: params.serviceType.companyFormId,
        userName: params.userName,
        userPhone: params.userPhone,
        finalClientName: params.finalClientName,
        customerDocument: params.customerDocument,
        fromAddress: params.fromAddress,
        fromCity: params.fromCity,
        toAddress: params.toAddress,
        toCity: params.toCity,
        scheduledDate: params.scheduledDate,
        note: params.note,
        plate: params.plate,
        fields: params.fields,
      });
      return createService(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['wip', 'myServices'] });
    },
  });

  const fetchServiceById = useCallback(async (serviceId: string) => {
    return getServiceById(serviceId);
  }, []);

  const searchMyServices = useCallback(async (subject?: string) => {
    return searchServices({
      pageSize: 20,
      page: 0,
      sort: 'scheduledDate',
      sortDirection: 'Desc',
      companyId: WIP_IDS.companyId,
      userId: WIP_IDS.userId,
      subject: subject ?? '',
    });
  }, []);

  const fetchSubscriptions = useCallback(async (businessUnitId: string, searchTerm: string) => {
    return getSubscriptions(businessUnitId, searchTerm);
  }, []);

  const fetchSubscriptionConsumption = useCallback(async (customerId: string, businessUnitId: string) => {
    return getSubscriptionConsumption({
      customerId,
      businessUnitId,
      timeZone: 'America/Bogota',
      companyId: WIP_IDS.companyId,
    });
  }, []);

  const getWipLocalStatus = useCallback((wipStatus: string) => {
    return mapWipStatusToLocal(wipStatus);
  }, []);

  return useMemo(() => ({
    businessUnits,
    allServiceTypes,
    isLoadingBusinessUnits: businessUnitsQuery.isLoading,
    businessUnitsError: businessUnitsQuery.error,
    refetchBusinessUnits: businessUnitsQuery.refetch,
    createServiceMutation,
    fetchServiceById,
    searchMyServices,
    fetchSubscriptions,
    fetchSubscriptionConsumption,
    getWipLocalStatus,
  }), [
    businessUnits,
    allServiceTypes,
    businessUnitsQuery.isLoading,
    businessUnitsQuery.error,
    businessUnitsQuery.refetch,
    createServiceMutation,
    fetchServiceById,
    searchMyServices,
    fetchSubscriptions,
    fetchSubscriptionConsumption,
    getWipLocalStatus,
  ]);
});
