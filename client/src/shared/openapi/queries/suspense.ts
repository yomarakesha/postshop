// generated with @7nohe/openapi-react-query-codegen@2.1.0 

import { useSuspenseQuery, UseSuspenseQueryOptions } from "@tanstack/react-query";
import type { Options } from "../requests/sdk.gen";
import { downloadShopDocumentShopBasesShopIdDocumentsFilenameGet, getAllShopsFullShopBasesFullGet, getBannerBannersBannerIdGet, getBannersBannersGet, getBrandBrandsBrandIdGet, getBrandsBrandsGet, getBrandsByCategoryAndCityProductsBrandsGet, getCartCartGet, getCategoriesCategoriesGet, getCategoryCategoriesCategoryIdGet, getCitiesCitiesGet, getCityCitiesCityIdGet, getClientsStatisticsStatisticsClientsGet, getCollectionCollectionsCollectionIdGet, getCollectionsCollectionsGet, getCountriesCountriesGet, getCountryCountriesCountryIdGet, getCurrenciesCurrenciesGet, getCurrencyCurrenciesCurrencyIdGet, getFavoritesFavoritesGet, getMeasureUnitMeasureUnitsUnitIdGet, getMeasureUnitsMeasureUnitsGet, getMeUsersMeGet, getModerationCountProductsModerationCountGet, getModerationQueueProductsModerationGet, getMyOrdersOrdersMyGet, getMyProductsProductsMyGet, getOrderOrdersOrderIdGet, getOrdersOrdersGet, getOrdersStatisticsStatisticsOrdersGet, getOrderStatusesOrderStatusesGet, getOrderStatusOrderStatusesOrderStatusIdGet, getPendingShopsCountShopBasesPendingCountGet, getPickupPointPickupPointsPickupPointIdGet, getPickupPointsPickupPointsGet, getProductBalanceStockOperationsProductIdBalanceGet, getProductForModerationProductsModerationProductIdGet, getProductProductsProductIdGet, getProductsAvailabilityStockOperationsAvailabilityGet, getProductsProductsGet, getProductStockStockOperationsProductIdGet, getReceiptStockReceiptsReceiptIdGet, getRegionRegionsRegionIdGet, getRegionsRegionsGet, getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet, getShopAdditionalShopAdditionalsShopAdditionalIdGet, getShopAdditionalsShopAdditionalsGet, getShopBaseShopBasesShopIdGet, getShopBasesShopBasesGet, getShopInsightsOrdersShopShopIdInsightsGet, getShopOrdersOrdersShopShopIdGet, getShopsStatisticsStatisticsShopsGet, getShopSummaryOrdersShopShopIdSummaryGet, getShopTopProductsOrdersShopShopIdTopProductsGet, getShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGet, getSimilarProductsProductsProductIdSimilarGet, getUserPermissionsPermissionsUserIdPermissionsGet, getUsersUsersGet, getUserUsersUserIdGet, getWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGet, getWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGet, getWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGet, getWarehousesWarehousesGet, getWarehouseWarehousesWarehouseIdGet, healthCheckGet, listAddressesUserAddressesGet, listAllPermissionsPermissionsGet, listNotificationsNotificationsGet, listOwnReturnsReturnsMyGet, listOwnReviewsReviewsMyGet, listProductReviewsReviewsProductProductIdGet, listReceiptsStockReceiptsGet, listReturnsReturnsGet, listShopReturnsReturnsShopShopIdGet, meAuthMeGet, moderationCountReviewsModerationCountGet, moderationQueueReviewsModerationGet, pendingCountReturnsCountGet, productReviewSummaryReviewsProductProductIdSummaryGet, readContactUsContactUsGet, readDeliveryMessageDeliveryMessageGet, readFeaturesFeaturesGet, reviewEligibilityReviewsProductProductIdEligibilityGet, searchSearchGet, unreadCountNotificationsUnreadCountGet } from "../requests/sdk.gen";
import { DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetData, DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetError, GetAllShopsFullShopBasesFullGetData, GetAllShopsFullShopBasesFullGetError, GetBannerBannersBannerIdGetData, GetBannerBannersBannerIdGetError, GetBannersBannersGetData, GetBannersBannersGetError, GetBrandBrandsBrandIdGetData, GetBrandBrandsBrandIdGetError, GetBrandsBrandsGetData, GetBrandsBrandsGetError, GetBrandsByCategoryAndCityProductsBrandsGetData, GetBrandsByCategoryAndCityProductsBrandsGetError, GetCartCartGetData, GetCategoriesCategoriesGetData, GetCategoriesCategoriesGetError, GetCategoryCategoriesCategoryIdGetData, GetCategoryCategoriesCategoryIdGetError, GetCitiesCitiesGetData, GetCitiesCitiesGetError, GetCityCitiesCityIdGetData, GetCityCitiesCityIdGetError, GetClientsStatisticsStatisticsClientsGetData, GetCollectionCollectionsCollectionIdGetData, GetCollectionCollectionsCollectionIdGetError, GetCollectionsCollectionsGetData, GetCollectionsCollectionsGetError, GetCountriesCountriesGetData, GetCountriesCountriesGetError, GetCountryCountriesCountryIdGetData, GetCountryCountriesCountryIdGetError, GetCurrenciesCurrenciesGetData, GetCurrenciesCurrenciesGetError, GetCurrencyCurrenciesCurrencyIdGetData, GetCurrencyCurrenciesCurrencyIdGetError, GetFavoritesFavoritesGetData, GetMeasureUnitMeasureUnitsUnitIdGetData, GetMeasureUnitMeasureUnitsUnitIdGetError, GetMeasureUnitsMeasureUnitsGetData, GetMeasureUnitsMeasureUnitsGetError, GetMeUsersMeGetData, GetModerationCountProductsModerationCountGetData, GetModerationQueueProductsModerationGetData, GetModerationQueueProductsModerationGetError, GetMyOrdersOrdersMyGetData, GetMyOrdersOrdersMyGetError, GetMyProductsProductsMyGetData, GetMyProductsProductsMyGetError, GetOrderOrdersOrderIdGetData, GetOrderOrdersOrderIdGetError, GetOrdersOrdersGetData, GetOrdersOrdersGetError, GetOrdersStatisticsStatisticsOrdersGetData, GetOrderStatusesOrderStatusesGetData, GetOrderStatusOrderStatusesOrderStatusIdGetData, GetOrderStatusOrderStatusesOrderStatusIdGetError, GetPendingShopsCountShopBasesPendingCountGetData, GetPickupPointPickupPointsPickupPointIdGetData, GetPickupPointPickupPointsPickupPointIdGetError, GetPickupPointsPickupPointsGetData, GetPickupPointsPickupPointsGetError, GetProductBalanceStockOperationsProductIdBalanceGetData, GetProductBalanceStockOperationsProductIdBalanceGetError, GetProductForModerationProductsModerationProductIdGetData, GetProductForModerationProductsModerationProductIdGetError, GetProductProductsProductIdGetData, GetProductProductsProductIdGetError, GetProductsAvailabilityStockOperationsAvailabilityGetData, GetProductsAvailabilityStockOperationsAvailabilityGetError, GetProductsProductsGetData, GetProductsProductsGetError, GetProductStockStockOperationsProductIdGetData, GetProductStockStockOperationsProductIdGetError, GetReceiptStockReceiptsReceiptIdGetData, GetReceiptStockReceiptsReceiptIdGetError, GetRegionRegionsRegionIdGetData, GetRegionRegionsRegionIdGetError, GetRegionsRegionsGetData, GetRegionsRegionsGetError, GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetData, GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetError, GetShopAdditionalShopAdditionalsShopAdditionalIdGetData, GetShopAdditionalShopAdditionalsShopAdditionalIdGetError, GetShopAdditionalsShopAdditionalsGetData, GetShopAdditionalsShopAdditionalsGetError, GetShopBaseShopBasesShopIdGetData, GetShopBaseShopBasesShopIdGetError, GetShopBasesShopBasesGetData, GetShopBasesShopBasesGetError, GetShopInsightsOrdersShopShopIdInsightsGetData, GetShopInsightsOrdersShopShopIdInsightsGetError, GetShopOrdersOrdersShopShopIdGetData, GetShopOrdersOrdersShopShopIdGetError, GetShopsStatisticsStatisticsShopsGetData, GetShopSummaryOrdersShopShopIdSummaryGetData, GetShopSummaryOrdersShopShopIdSummaryGetError, GetShopTopProductsOrdersShopShopIdTopProductsGetData, GetShopTopProductsOrdersShopShopIdTopProductsGetError, GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetData, GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetError, GetSimilarProductsProductsProductIdSimilarGetData, GetSimilarProductsProductsProductIdSimilarGetError, GetUserPermissionsPermissionsUserIdPermissionsGetData, GetUserPermissionsPermissionsUserIdPermissionsGetError, GetUsersUsersGetData, GetUsersUsersGetError, GetUserUsersUserIdGetData, GetUserUsersUserIdGetError, GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetData, GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetError, GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetData, GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetError, GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetData, GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetError, GetWarehousesWarehousesGetData, GetWarehousesWarehousesGetError, GetWarehouseWarehousesWarehouseIdGetData, GetWarehouseWarehousesWarehouseIdGetError, HealthCheckGetData, ListAddressesUserAddressesGetData, ListAllPermissionsPermissionsGetData, ListNotificationsNotificationsGetData, ListNotificationsNotificationsGetError, ListOwnReturnsReturnsMyGetData, ListOwnReviewsReviewsMyGetData, ListProductReviewsReviewsProductProductIdGetData, ListProductReviewsReviewsProductProductIdGetError, ListReceiptsStockReceiptsGetData, ListReceiptsStockReceiptsGetError, ListReturnsReturnsGetData, ListReturnsReturnsGetError, ListShopReturnsReturnsShopShopIdGetData, ListShopReturnsReturnsShopShopIdGetError, MeAuthMeGetData, ModerationCountReviewsModerationCountGetData, ModerationQueueReviewsModerationGetData, ModerationQueueReviewsModerationGetError, PendingCountReturnsCountGetData, ProductReviewSummaryReviewsProductProductIdSummaryGetData, ProductReviewSummaryReviewsProductProductIdSummaryGetError, ReadContactUsContactUsGetData, ReadContactUsContactUsGetError, ReadDeliveryMessageDeliveryMessageGetData, ReadFeaturesFeaturesGetData, ReviewEligibilityReviewsProductProductIdEligibilityGetData, ReviewEligibilityReviewsProductProductIdEligibilityGetError, SearchSearchGetData, SearchSearchGetError, UnreadCountNotificationsUnreadCountGetData } from "../requests/types.gen";
import * as Common from "./common";
/**
* Me
*/
export const useMeAuthMeGetSuspense = <TData = NonNullable<Common.MeAuthMeGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<MeAuthMeGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseMeAuthMeGetKeyFn(clientOptions, queryKey), queryFn: () => meAuthMeGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Users
*/
export const useGetUsersUsersGetSuspense = <TData = NonNullable<Common.GetUsersUsersGetDefaultResponse>, TError = GetUsersUsersGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetUsersUsersGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetUsersUsersGetKeyFn(clientOptions, queryKey), queryFn: () => getUsersUsersGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Me
*
* Текущий пользователь видит свой профиль и список своих прав.
*/
export const useGetMeUsersMeGetSuspense = <TData = NonNullable<Common.GetMeUsersMeGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMeUsersMeGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetMeUsersMeGetKeyFn(clientOptions, queryKey), queryFn: () => getMeUsersMeGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get User
*/
export const useGetUserUsersUserIdGetSuspense = <TData = NonNullable<Common.GetUserUsersUserIdGetDefaultResponse>, TError = GetUserUsersUserIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetUserUsersUserIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetUserUsersUserIdGetKeyFn(clientOptions, queryKey), queryFn: () => getUserUsersUserIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List All Permissions
*
* Список всех доступных в системе прав.
*/
export const useListAllPermissionsPermissionsGetSuspense = <TData = NonNullable<Common.ListAllPermissionsPermissionsGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListAllPermissionsPermissionsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseListAllPermissionsPermissionsGetKeyFn(clientOptions, queryKey), queryFn: () => listAllPermissionsPermissionsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get User Permissions
*
* Права пользователя вместе с тем, кто и когда их выдал.
*
* granted_at и granted_by писались, но не читались нигде — аудит выдачи прав
* был недостижим. Пустой granted_by означает системную выдачу: регистрация
* по SMS и первичное заполнение прав.
*/
export const useGetUserPermissionsPermissionsUserIdPermissionsGetSuspense = <TData = NonNullable<Common.GetUserPermissionsPermissionsUserIdPermissionsGetDefaultResponse>, TError = GetUserPermissionsPermissionsUserIdPermissionsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetUserPermissionsPermissionsUserIdPermissionsGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetUserPermissionsPermissionsUserIdPermissionsGetKeyFn(clientOptions, queryKey), queryFn: () => getUserPermissionsPermissionsUserIdPermissionsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Brands
*/
export const useGetBrandsBrandsGetSuspense = <TData = NonNullable<Common.GetBrandsBrandsGetDefaultResponse>, TError = GetBrandsBrandsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBrandsBrandsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetBrandsBrandsGetKeyFn(clientOptions, queryKey), queryFn: () => getBrandsBrandsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Brand
*/
export const useGetBrandBrandsBrandIdGetSuspense = <TData = NonNullable<Common.GetBrandBrandsBrandIdGetDefaultResponse>, TError = GetBrandBrandsBrandIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBrandBrandsBrandIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetBrandBrandsBrandIdGetKeyFn(clientOptions, queryKey), queryFn: () => getBrandBrandsBrandIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Categories
*/
export const useGetCategoriesCategoriesGetSuspense = <TData = NonNullable<Common.GetCategoriesCategoriesGetDefaultResponse>, TError = GetCategoriesCategoriesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCategoriesCategoriesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCategoriesCategoriesGetKeyFn(clientOptions, queryKey), queryFn: () => getCategoriesCategoriesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Category
*/
export const useGetCategoryCategoriesCategoryIdGetSuspense = <TData = NonNullable<Common.GetCategoryCategoriesCategoryIdGetDefaultResponse>, TError = GetCategoryCategoriesCategoryIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCategoryCategoriesCategoryIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCategoryCategoriesCategoryIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCategoryCategoriesCategoryIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Countries
*/
export const useGetCountriesCountriesGetSuspense = <TData = NonNullable<Common.GetCountriesCountriesGetDefaultResponse>, TError = GetCountriesCountriesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCountriesCountriesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCountriesCountriesGetKeyFn(clientOptions, queryKey), queryFn: () => getCountriesCountriesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Country
*/
export const useGetCountryCountriesCountryIdGetSuspense = <TData = NonNullable<Common.GetCountryCountriesCountryIdGetDefaultResponse>, TError = GetCountryCountriesCountryIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCountryCountriesCountryIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCountryCountriesCountryIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCountryCountriesCountryIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Regions
*/
export const useGetRegionsRegionsGetSuspense = <TData = NonNullable<Common.GetRegionsRegionsGetDefaultResponse>, TError = GetRegionsRegionsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetRegionsRegionsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetRegionsRegionsGetKeyFn(clientOptions, queryKey), queryFn: () => getRegionsRegionsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Region
*/
export const useGetRegionRegionsRegionIdGetSuspense = <TData = NonNullable<Common.GetRegionRegionsRegionIdGetDefaultResponse>, TError = GetRegionRegionsRegionIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetRegionRegionsRegionIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetRegionRegionsRegionIdGetKeyFn(clientOptions, queryKey), queryFn: () => getRegionRegionsRegionIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Cities
*/
export const useGetCitiesCitiesGetSuspense = <TData = NonNullable<Common.GetCitiesCitiesGetDefaultResponse>, TError = GetCitiesCitiesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCitiesCitiesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCitiesCitiesGetKeyFn(clientOptions, queryKey), queryFn: () => getCitiesCitiesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get City
*/
export const useGetCityCitiesCityIdGetSuspense = <TData = NonNullable<Common.GetCityCitiesCityIdGetDefaultResponse>, TError = GetCityCitiesCityIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCityCitiesCityIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCityCitiesCityIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCityCitiesCityIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Currencies
*/
export const useGetCurrenciesCurrenciesGetSuspense = <TData = NonNullable<Common.GetCurrenciesCurrenciesGetDefaultResponse>, TError = GetCurrenciesCurrenciesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCurrenciesCurrenciesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCurrenciesCurrenciesGetKeyFn(clientOptions, queryKey), queryFn: () => getCurrenciesCurrenciesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Currency
*/
export const useGetCurrencyCurrenciesCurrencyIdGetSuspense = <TData = NonNullable<Common.GetCurrencyCurrenciesCurrencyIdGetDefaultResponse>, TError = GetCurrencyCurrenciesCurrencyIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCurrencyCurrenciesCurrencyIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCurrencyCurrenciesCurrencyIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCurrencyCurrenciesCurrencyIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Measure Units
*/
export const useGetMeasureUnitsMeasureUnitsGetSuspense = <TData = NonNullable<Common.GetMeasureUnitsMeasureUnitsGetDefaultResponse>, TError = GetMeasureUnitsMeasureUnitsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMeasureUnitsMeasureUnitsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetMeasureUnitsMeasureUnitsGetKeyFn(clientOptions, queryKey), queryFn: () => getMeasureUnitsMeasureUnitsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Measure Unit
*/
export const useGetMeasureUnitMeasureUnitsUnitIdGetSuspense = <TData = NonNullable<Common.GetMeasureUnitMeasureUnitsUnitIdGetDefaultResponse>, TError = GetMeasureUnitMeasureUnitsUnitIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMeasureUnitMeasureUnitsUnitIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetMeasureUnitMeasureUnitsUnitIdGetKeyFn(clientOptions, queryKey), queryFn: () => getMeasureUnitMeasureUnitsUnitIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Bases
*/
export const useGetShopBasesShopBasesGetSuspense = <TData = NonNullable<Common.GetShopBasesShopBasesGetDefaultResponse>, TError = GetShopBasesShopBasesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopBasesShopBasesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopBasesShopBasesGetKeyFn(clientOptions, queryKey), queryFn: () => getShopBasesShopBasesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get All Shops Full
*/
export const useGetAllShopsFullShopBasesFullGetSuspense = <TData = NonNullable<Common.GetAllShopsFullShopBasesFullGetDefaultResponse>, TError = GetAllShopsFullShopBasesFullGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetAllShopsFullShopBasesFullGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetAllShopsFullShopBasesFullGetKeyFn(clientOptions, queryKey), queryFn: () => getAllShopsFullShopBasesFullGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Pending Shops Count
*
* Количество заявок на новый магазин (статус регистрации = pending).
*/
export const useGetPendingShopsCountShopBasesPendingCountGetSuspense = <TData = NonNullable<Common.GetPendingShopsCountShopBasesPendingCountGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetPendingShopsCountShopBasesPendingCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetPendingShopsCountShopBasesPendingCountGetKeyFn(clientOptions, queryKey), queryFn: () => getPendingShopsCountShopBasesPendingCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Base
*
* Карточка магазина с владельцем и документами — своя либо для сотрудника.
*/
export const useGetShopBaseShopBasesShopIdGetSuspense = <TData = NonNullable<Common.GetShopBaseShopBasesShopIdGetDefaultResponse>, TError = GetShopBaseShopBasesShopIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopBaseShopBasesShopIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopBaseShopBasesShopIdGetKeyFn(clientOptions, queryKey), queryFn: () => getShopBaseShopBasesShopIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Download Shop Document
*
* Выдаёт документ магазина владельцу или сотруднику платформы.
*
* Файлы лежат в uploads/, который раздаётся как статика, поэтому раньше
* паспорт и свидетельство скачивал любой, кто знал ссылку, без токена.
* Прямой путь /uploads/documents/... теперь закрыт (см. app/main.py), а
* единственный способ получить файл — этот метод с проверкой владения.
*/
export const useDownloadShopDocumentShopBasesShopIdDocumentsFilenameGetSuspense = <TData = NonNullable<Common.DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetDefaultResponse>, TError = DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<DownloadShopDocumentShopBasesShopIdDocumentsFilenameGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseDownloadShopDocumentShopBasesShopIdDocumentsFilenameGetKeyFn(clientOptions, queryKey), queryFn: () => downloadShopDocumentShopBasesShopIdDocumentsFilenameGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Additionals
*/
export const useGetShopAdditionalsShopAdditionalsGetSuspense = <TData = NonNullable<Common.GetShopAdditionalsShopAdditionalsGetDefaultResponse>, TError = GetShopAdditionalsShopAdditionalsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopAdditionalsShopAdditionalsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopAdditionalsShopAdditionalsGetKeyFn(clientOptions, queryKey), queryFn: () => getShopAdditionalsShopAdditionalsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Additional By Shop Base
*/
export const useGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetSuspense = <TData = NonNullable<Common.GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetDefaultResponse>, TError = GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGetKeyFn(clientOptions, queryKey), queryFn: () => getShopAdditionalByShopBaseShopAdditionalsByShopShopBaseIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Additional
*/
export const useGetShopAdditionalShopAdditionalsShopAdditionalIdGetSuspense = <TData = NonNullable<Common.GetShopAdditionalShopAdditionalsShopAdditionalIdGetDefaultResponse>, TError = GetShopAdditionalShopAdditionalsShopAdditionalIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopAdditionalShopAdditionalsShopAdditionalIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopAdditionalShopAdditionalsShopAdditionalIdGetKeyFn(clientOptions, queryKey), queryFn: () => getShopAdditionalShopAdditionalsShopAdditionalIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Products
*/
export const useGetProductsProductsGetSuspense = <TData = NonNullable<Common.GetProductsProductsGetDefaultResponse>, TError = GetProductsProductsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductsProductsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetProductsProductsGetKeyFn(clientOptions, queryKey), queryFn: () => getProductsProductsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get My Products
*
* «Мои товары» владельца: товары его магазинов в любом статусе (включая pending/declined).
*
* Если передан `shop_base_id` — возвращаются товары только этого магазина (при условии,
* что он принадлежит текущему пользователю).
*/
export const useGetMyProductsProductsMyGetSuspense = <TData = NonNullable<Common.GetMyProductsProductsMyGetDefaultResponse>, TError = GetMyProductsProductsMyGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMyProductsProductsMyGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetMyProductsProductsMyGetKeyFn(clientOptions, queryKey), queryFn: () => getMyProductsProductsMyGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Moderation Count
*
* Количество товаров, ожидающих модерации (status = pending).
*/
export const useGetModerationCountProductsModerationCountGetSuspense = <TData = NonNullable<Common.GetModerationCountProductsModerationCountGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetModerationCountProductsModerationCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetModerationCountProductsModerationCountGetKeyFn(clientOptions, queryKey), queryFn: () => getModerationCountProductsModerationCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Moderation Queue
*
* Очередь модерации (для администратора): товары по статусу, без скрытия немодерированных.
*/
export const useGetModerationQueueProductsModerationGetSuspense = <TData = NonNullable<Common.GetModerationQueueProductsModerationGetDefaultResponse>, TError = GetModerationQueueProductsModerationGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetModerationQueueProductsModerationGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetModerationQueueProductsModerationGetKeyFn(clientOptions, queryKey), queryFn: () => getModerationQueueProductsModerationGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Product For Moderation
*
* Полная информация о товаре для администратора — в любом статусе и вне зависимости от активности.
*/
export const useGetProductForModerationProductsModerationProductIdGetSuspense = <TData = NonNullable<Common.GetProductForModerationProductsModerationProductIdGetDefaultResponse>, TError = GetProductForModerationProductsModerationProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductForModerationProductsModerationProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetProductForModerationProductsModerationProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => getProductForModerationProductsModerationProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Brands By Category And City
*
* Уникальные бренды, у которых есть видимые товары в данной категории и городе.
*/
export const useGetBrandsByCategoryAndCityProductsBrandsGetSuspense = <TData = NonNullable<Common.GetBrandsByCategoryAndCityProductsBrandsGetDefaultResponse>, TError = GetBrandsByCategoryAndCityProductsBrandsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBrandsByCategoryAndCityProductsBrandsGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetBrandsByCategoryAndCityProductsBrandsGetKeyFn(clientOptions, queryKey), queryFn: () => getBrandsByCategoryAndCityProductsBrandsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Product
*/
export const useGetProductProductsProductIdGetSuspense = <TData = NonNullable<Common.GetProductProductsProductIdGetDefaultResponse>, TError = GetProductProductsProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductProductsProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetProductProductsProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => getProductProductsProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Similar Products
*/
export const useGetSimilarProductsProductsProductIdSimilarGetSuspense = <TData = NonNullable<Common.GetSimilarProductsProductsProductIdSimilarGetDefaultResponse>, TError = GetSimilarProductsProductsProductIdSimilarGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetSimilarProductsProductsProductIdSimilarGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetSimilarProductsProductsProductIdSimilarGetKeyFn(clientOptions, queryKey), queryFn: () => getSimilarProductsProductsProductIdSimilarGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Banners
*/
export const useGetBannersBannersGetSuspense = <TData = NonNullable<Common.GetBannersBannersGetDefaultResponse>, TError = GetBannersBannersGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBannersBannersGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetBannersBannersGetKeyFn(clientOptions, queryKey), queryFn: () => getBannersBannersGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Banner
*/
export const useGetBannerBannersBannerIdGetSuspense = <TData = NonNullable<Common.GetBannerBannersBannerIdGetDefaultResponse>, TError = GetBannerBannersBannerIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetBannerBannersBannerIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetBannerBannersBannerIdGetKeyFn(clientOptions, queryKey), queryFn: () => getBannerBannersBannerIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Collections
*/
export const useGetCollectionsCollectionsGetSuspense = <TData = NonNullable<Common.GetCollectionsCollectionsGetDefaultResponse>, TError = GetCollectionsCollectionsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCollectionsCollectionsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCollectionsCollectionsGetKeyFn(clientOptions, queryKey), queryFn: () => getCollectionsCollectionsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Collection
*/
export const useGetCollectionCollectionsCollectionIdGetSuspense = <TData = NonNullable<Common.GetCollectionCollectionsCollectionIdGetDefaultResponse>, TError = GetCollectionCollectionsCollectionIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCollectionCollectionsCollectionIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCollectionCollectionsCollectionIdGetKeyFn(clientOptions, queryKey), queryFn: () => getCollectionCollectionsCollectionIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Cart
*/
export const useGetCartCartGetSuspense = <TData = NonNullable<Common.GetCartCartGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetCartCartGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetCartCartGetKeyFn(clientOptions, queryKey), queryFn: () => getCartCartGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Favorites
*/
export const useGetFavoritesFavoritesGetSuspense = <TData = NonNullable<Common.GetFavoritesFavoritesGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetFavoritesFavoritesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetFavoritesFavoritesGetKeyFn(clientOptions, queryKey), queryFn: () => getFavoritesFavoritesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Addresses
*
* Свои адреса. Чужих в выдаче нет: фильтр по владельцу, а не по запросу.
*/
export const useListAddressesUserAddressesGetSuspense = <TData = NonNullable<Common.ListAddressesUserAddressesGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListAddressesUserAddressesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseListAddressesUserAddressesGetKeyFn(clientOptions, queryKey), queryFn: () => listAddressesUserAddressesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Product Reviews
*
* Подтверждённые отзывы о товаре. Метод публичный: отзывы для покупателей.
*/
export const useListProductReviewsReviewsProductProductIdGetSuspense = <TData = NonNullable<Common.ListProductReviewsReviewsProductProductIdGetDefaultResponse>, TError = ListProductReviewsReviewsProductProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListProductReviewsReviewsProductProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseListProductReviewsReviewsProductProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => listProductReviewsReviewsProductProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Product Review Summary
*
* Сводка по товару: средняя оценка, количество и разбивка по звёздам.
*
* Средняя и количество берутся из товара — они уже пересчитаны и совпадают с
* тем, что показано в каталоге. Разбивка считается запросом: она нужна только
* на карточке товара, и хранить её незачем.
*/
export const useProductReviewSummaryReviewsProductProductIdSummaryGetSuspense = <TData = NonNullable<Common.ProductReviewSummaryReviewsProductProductIdSummaryGetDefaultResponse>, TError = ProductReviewSummaryReviewsProductProductIdSummaryGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ProductReviewSummaryReviewsProductProductIdSummaryGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseProductReviewSummaryReviewsProductProductIdSummaryGetKeyFn(clientOptions, queryKey), queryFn: () => productReviewSummaryReviewsProductProductIdSummaryGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Review Eligibility
*
* Можно ли оставить отзыв на этот товар.
*
* Отдельный метод, потому что форму надо показать или не показать до того, как
* человек начнёт писать: получить отказ после набранного текста — худший из
* возможных вариантов.
*/
export const useReviewEligibilityReviewsProductProductIdEligibilityGetSuspense = <TData = NonNullable<Common.ReviewEligibilityReviewsProductProductIdEligibilityGetDefaultResponse>, TError = ReviewEligibilityReviewsProductProductIdEligibilityGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ReviewEligibilityReviewsProductProductIdEligibilityGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseReviewEligibilityReviewsProductProductIdEligibilityGetKeyFn(clientOptions, queryKey), queryFn: () => reviewEligibilityReviewsProductProductIdEligibilityGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Own Reviews
*
* Свои отзывы в любом состоянии.
*
* Автор должен видеть и непроверенные, и отклонённые вместе с причиной: иначе
* отзыв после отправки просто пропадает, и непонятно, дошёл ли он.
*/
export const useListOwnReviewsReviewsMyGetSuspense = <TData = NonNullable<Common.ListOwnReviewsReviewsMyGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListOwnReviewsReviewsMyGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseListOwnReviewsReviewsMyGetKeyFn(clientOptions, queryKey), queryFn: () => listOwnReviewsReviewsMyGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Moderation Queue
*
* Очередь проверки. По умолчанию — непроверенные.
*
* Пагинация через общие limit_param/skip_param, а не своим Query: свой предел
* в 100 расходился с остальными списками (общий максимум — 500), и админка,
* запрашивающая 500, получала 422 на пустой странице.
*/
export const useModerationQueueReviewsModerationGetSuspense = <TData = NonNullable<Common.ModerationQueueReviewsModerationGetDefaultResponse>, TError = ModerationQueueReviewsModerationGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ModerationQueueReviewsModerationGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseModerationQueueReviewsModerationGetKeyFn(clientOptions, queryKey), queryFn: () => moderationQueueReviewsModerationGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Moderation Count
*
* Сколько отзывов ждёт проверки — для отметки в меню админки.
*/
export const useModerationCountReviewsModerationCountGetSuspense = <TData = NonNullable<Common.ModerationCountReviewsModerationCountGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ModerationCountReviewsModerationCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseModerationCountReviewsModerationCountGetKeyFn(clientOptions, queryKey), queryFn: () => moderationCountReviewsModerationCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Own Returns
*
* Свои заявки в любом состоянии.
*
* Отклонённые тоже: без них заявка после отказа просто исчезает, и непонятно,
* рассмотрели её или потеряли.
*/
export const useListOwnReturnsReturnsMyGetSuspense = <TData = NonNullable<Common.ListOwnReturnsReturnsMyGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListOwnReturnsReturnsMyGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseListOwnReturnsReturnsMyGetKeyFn(clientOptions, queryKey), queryFn: () => listOwnReturnsReturnsMyGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Returns
*
* Все заявки. Без фильтра — целиком, чтобы видеть и разобранные.
*/
export const useListReturnsReturnsGetSuspense = <TData = NonNullable<Common.ListReturnsReturnsGetDefaultResponse>, TError = ListReturnsReturnsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListReturnsReturnsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseListReturnsReturnsGetKeyFn(clientOptions, queryKey), queryFn: () => listReturnsReturnsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Shop Returns
*
* Заявки на возврат по товарам одного магазина.
*
* Продавцу об оформленном возврате приходило уведомление, а посмотреть его
* было негде: список заявок доступен только платформе (RETURNS_MANAGE), и
* экрана в кабинете не существовало. Продавец узнавал, что возврат случился,
* и не мог узнать ни по какому товару, ни по какой причине.
*
* Решение по заявке остаётся за платформой — здесь только чтение.
*/
export const useListShopReturnsReturnsShopShopIdGetSuspense = <TData = NonNullable<Common.ListShopReturnsReturnsShopShopIdGetDefaultResponse>, TError = ListShopReturnsReturnsShopShopIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListShopReturnsReturnsShopShopIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseListShopReturnsReturnsShopShopIdGetKeyFn(clientOptions, queryKey), queryFn: () => listShopReturnsReturnsShopShopIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Pending Count
*
* Сколько заявок ждёт решения — для отметки в меню админки.
*/
export const usePendingCountReturnsCountGetSuspense = <TData = NonNullable<Common.PendingCountReturnsCountGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<PendingCountReturnsCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UsePendingCountReturnsCountGetKeyFn(clientOptions, queryKey), queryFn: () => pendingCountReturnsCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Notifications
*
* Свои уведомления, новые сверху.
*
* Отдельного права нет: уведомления адресные, и фильтр по владельцу — не
* ограничение доступа, а само определение выдачи.
*/
export const useListNotificationsNotificationsGetSuspense = <TData = NonNullable<Common.ListNotificationsNotificationsGetDefaultResponse>, TError = ListNotificationsNotificationsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListNotificationsNotificationsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseListNotificationsNotificationsGetKeyFn(clientOptions, queryKey), queryFn: () => listNotificationsNotificationsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Unread Count
*
* Сколько непрочитанных — для отметки в интерфейсе.
*/
export const useUnreadCountNotificationsUnreadCountGetSuspense = <TData = NonNullable<Common.UnreadCountNotificationsUnreadCountGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<UnreadCountNotificationsUnreadCountGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseUnreadCountNotificationsUnreadCountGetKeyFn(clientOptions, queryKey), queryFn: () => unreadCountNotificationsUnreadCountGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Warehouses
*/
export const useGetWarehousesWarehousesGetSuspense = <TData = NonNullable<Common.GetWarehousesWarehousesGetDefaultResponse>, TError = GetWarehousesWarehousesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehousesWarehousesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetWarehousesWarehousesGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehousesWarehousesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Warehouse
*/
export const useGetWarehouseWarehousesWarehouseIdGetSuspense = <TData = NonNullable<Common.GetWarehouseWarehousesWarehouseIdGetDefaultResponse>, TError = GetWarehouseWarehousesWarehouseIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehouseWarehousesWarehouseIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetWarehouseWarehousesWarehouseIdGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehouseWarehousesWarehouseIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Read Delivery Message
*/
export const useReadDeliveryMessageDeliveryMessageGetSuspense = <TData = NonNullable<Common.ReadDeliveryMessageDeliveryMessageGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ReadDeliveryMessageDeliveryMessageGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseReadDeliveryMessageDeliveryMessageGetKeyFn(clientOptions, queryKey), queryFn: () => readDeliveryMessageDeliveryMessageGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Products Availability
*
* Доступный остаток по нескольким товарам сразу.
*
* Поштучный опрос (единственное, что было) для карточки и списка не годится, а
* в самом ответе товара остатка нет вовсе. Метод публичный: сколько товара на
* полке — это то же самое, что покупатель видит в магазине.
*
* Считается доступный остаток, а не сырой баланс журнала: то, что уже держат
* открытые заказы, купить нельзя. Остаток берётся из журнала своего типа:
* FBS — из журнала магазина, FBO — со складов платформы. tracked=false —
* остаток покупку не ограничивает (FBO при выключенном складе платформы).
*/
export const useGetProductsAvailabilityStockOperationsAvailabilityGetSuspense = <TData = NonNullable<Common.GetProductsAvailabilityStockOperationsAvailabilityGetDefaultResponse>, TError = GetProductsAvailabilityStockOperationsAvailabilityGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductsAvailabilityStockOperationsAvailabilityGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetProductsAvailabilityStockOperationsAvailabilityGetKeyFn(clientOptions, queryKey), queryFn: () => getProductsAvailabilityStockOperationsAvailabilityGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Product Stock
*
* Журнал движений товара — коммерческая тайна магазина, только своя.
*/
export const useGetProductStockStockOperationsProductIdGetSuspense = <TData = NonNullable<Common.GetProductStockStockOperationsProductIdGetDefaultResponse>, TError = GetProductStockStockOperationsProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductStockStockOperationsProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetProductStockStockOperationsProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => getProductStockStockOperationsProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Product Balance
*/
export const useGetProductBalanceStockOperationsProductIdBalanceGetSuspense = <TData = NonNullable<Common.GetProductBalanceStockOperationsProductIdBalanceGetDefaultResponse>, TError = GetProductBalanceStockOperationsProductIdBalanceGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetProductBalanceStockOperationsProductIdBalanceGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetProductBalanceStockOperationsProductIdBalanceGetKeyFn(clientOptions, queryKey), queryFn: () => getProductBalanceStockOperationsProductIdBalanceGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Warehouse Balances
*
* Остатки всех товаров на складе.
*
* Такого метода не было: на странице склада в админке таблица «Товары на
* складе» была строкой-заглушкой без запроса и всегда сообщала, что склад
* пуст — независимо от настоящих остатков. Поштучный опрос по каждому товару
* (единственное, что было) для списка не годится.
*
* Товары с нулевым и отрицательным остатком не показываются: они на складе
* отсутствуют, а история по ним доступна отдельным методом.
*/
export const useGetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetSuspense = <TData = NonNullable<Common.GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetDefaultResponse>, TError = GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehouseBalancesWarehouseOperationsWarehouseWarehouseIdBalancesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Warehouse Product Stock
*/
export const useGetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetSuspense = <TData = NonNullable<Common.GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetDefaultResponse>, TError = GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehouseProductStockWarehouseOperationsWarehouseWarehouseIdProductProductIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Warehouse Product Balance
*/
export const useGetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetSuspense = <TData = NonNullable<Common.GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetDefaultResponse>, TError = GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGetKeyFn(clientOptions, queryKey), queryFn: () => getWarehouseProductBalanceWarehouseOperationsWarehouseWarehouseIdProductProductIdBalanceGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* List Receipts
*/
export const useListReceiptsStockReceiptsGetSuspense = <TData = NonNullable<Common.ListReceiptsStockReceiptsGetDefaultResponse>, TError = ListReceiptsStockReceiptsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ListReceiptsStockReceiptsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseListReceiptsStockReceiptsGetKeyFn(clientOptions, queryKey), queryFn: () => listReceiptsStockReceiptsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Receipt
*/
export const useGetReceiptStockReceiptsReceiptIdGetSuspense = <TData = NonNullable<Common.GetReceiptStockReceiptsReceiptIdGetDefaultResponse>, TError = GetReceiptStockReceiptsReceiptIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetReceiptStockReceiptsReceiptIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetReceiptStockReceiptsReceiptIdGetKeyFn(clientOptions, queryKey), queryFn: () => getReceiptStockReceiptsReceiptIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Enabled features
*/
export const useReadFeaturesFeaturesGetSuspense = <TData = NonNullable<Common.ReadFeaturesFeaturesGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ReadFeaturesFeaturesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseReadFeaturesFeaturesGetKeyFn(clientOptions, queryKey), queryFn: () => readFeaturesFeaturesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Order Statuses
*/
export const useGetOrderStatusesOrderStatusesGetSuspense = <TData = NonNullable<Common.GetOrderStatusesOrderStatusesGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrderStatusesOrderStatusesGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetOrderStatusesOrderStatusesGetKeyFn(clientOptions, queryKey), queryFn: () => getOrderStatusesOrderStatusesGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Order Status
*/
export const useGetOrderStatusOrderStatusesOrderStatusIdGetSuspense = <TData = NonNullable<Common.GetOrderStatusOrderStatusesOrderStatusIdGetDefaultResponse>, TError = GetOrderStatusOrderStatusesOrderStatusIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrderStatusOrderStatusesOrderStatusIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetOrderStatusOrderStatusesOrderStatusIdGetKeyFn(clientOptions, queryKey), queryFn: () => getOrderStatusOrderStatusesOrderStatusIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Pickup Points
*/
export const useGetPickupPointsPickupPointsGetSuspense = <TData = NonNullable<Common.GetPickupPointsPickupPointsGetDefaultResponse>, TError = GetPickupPointsPickupPointsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetPickupPointsPickupPointsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetPickupPointsPickupPointsGetKeyFn(clientOptions, queryKey), queryFn: () => getPickupPointsPickupPointsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Pickup Point
*/
export const useGetPickupPointPickupPointsPickupPointIdGetSuspense = <TData = NonNullable<Common.GetPickupPointPickupPointsPickupPointIdGetDefaultResponse>, TError = GetPickupPointPickupPointsPickupPointIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetPickupPointPickupPointsPickupPointIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetPickupPointPickupPointsPickupPointIdGetKeyFn(clientOptions, queryKey), queryFn: () => getPickupPointPickupPointsPickupPointIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Orders
*
* Список заказов.
*
* Право orders:read в описании помечено как административное, но выдаётся
* каждому при регистрации, и фильтра по владельцу здесь не было — любой
* зарегистрировавшийся читал все заказы платформы с телефонами и адресами
* покупателей. Теперь без права сотрудника выдача сужается до своих заказов.
*/
export const useGetOrdersOrdersGetSuspense = <TData = NonNullable<Common.GetOrdersOrdersGetDefaultResponse>, TError = GetOrdersOrdersGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrdersOrdersGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetOrdersOrdersGetKeyFn(clientOptions, queryKey), queryFn: () => getOrdersOrdersGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get My Orders
*/
export const useGetMyOrdersOrdersMyGetSuspense = <TData = NonNullable<Common.GetMyOrdersOrdersMyGetDefaultResponse>, TError = GetMyOrdersOrdersMyGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetMyOrdersOrdersMyGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetMyOrdersOrdersMyGetKeyFn(clientOptions, queryKey), queryFn: () => getMyOrdersOrdersMyGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Orders
*/
export const useGetShopOrdersOrdersShopShopIdGetSuspense = <TData = NonNullable<Common.GetShopOrdersOrdersShopShopIdGetDefaultResponse>, TError = GetShopOrdersOrdersShopShopIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopOrdersOrdersShopShopIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopOrdersOrdersShopShopIdGetKeyFn(clientOptions, queryKey), queryFn: () => getShopOrdersOrdersShopShopIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Top Products
*
* Самые покупаемые товары магазина — по суммарному проданному количеству
* в завершённых (completed) заказах. Учитываются только неотклонённые части.
*/
export const useGetShopTopProductsOrdersShopShopIdTopProductsGetSuspense = <TData = NonNullable<Common.GetShopTopProductsOrdersShopShopIdTopProductsGetDefaultResponse>, TError = GetShopTopProductsOrdersShopShopIdTopProductsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopTopProductsOrdersShopShopIdTopProductsGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopTopProductsOrdersShopShopIdTopProductsGetKeyFn(clientOptions, queryKey), queryFn: () => getShopTopProductsOrdersShopShopIdTopProductsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Summary
*
* Сводка магазина за период и такая же за предыдущий.
*
* Прежняя выдача считала только текущую неделю с понедельника: в понедельник
* утром продавец видел почти пустой график и решал, что всё сломалось. И
* главное — число без базы сравнения ничего не значит: «выручка 5000» не
* говорит, хорошо это или плохо, пока рядом нет прошлой недели.
*/
export const useGetShopSummaryOrdersShopShopIdSummaryGetSuspense = <TData = NonNullable<Common.GetShopSummaryOrdersShopShopIdSummaryGetDefaultResponse>, TError = GetShopSummaryOrdersShopShopIdSummaryGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopSummaryOrdersShopShopIdSummaryGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopSummaryOrdersShopShopIdSummaryGetKeyFn(clientOptions, queryKey), queryFn: () => getShopSummaryOrdersShopShopIdSummaryGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Insights
*
* Списки, по которым продавцу есть что сделать: что не продаётся, что
* возвращают, как оценивают.
*
* Отдельно от сводки: та отвечает на «как дела», эта — на «что чинить». В
* одном ответе они означали бы тяжёлые выборки при каждом переключении
* периода на графике.
*
* По умолчанию месяц, а не неделя: за неделю «не продавалось» покажет почти
* весь ассортимент и ничего не подскажет.
*/
export const useGetShopInsightsOrdersShopShopIdInsightsGetSuspense = <TData = NonNullable<Common.GetShopInsightsOrdersShopShopIdInsightsGetDefaultResponse>, TError = GetShopInsightsOrdersShopShopIdInsightsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopInsightsOrdersShopShopIdInsightsGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopInsightsOrdersShopShopIdInsightsGetKeyFn(clientOptions, queryKey), queryFn: () => getShopInsightsOrdersShopShopIdInsightsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shop Weekly Revenue
*
* Суммарный доход магазина за текущую неделю (с понедельника 00:00 этой
* недели) по завершённым заказам, без отклонённых частей. Период — по дате
* создания заказа (отдельной даты завершения в модели нет).
*/
export const useGetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetSuspense = <TData = NonNullable<Common.GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetDefaultResponse>, TError = GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGetKeyFn(clientOptions, queryKey), queryFn: () => getShopWeeklyRevenueOrdersShopShopIdWeeklyRevenueGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Order
*
* Заказ доступен покупателю, магазину из состава заказа и сотруднику.
*/
export const useGetOrderOrdersOrderIdGetSuspense = <TData = NonNullable<Common.GetOrderOrdersOrderIdGetDefaultResponse>, TError = GetOrderOrdersOrderIdGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrderOrdersOrderIdGetData, true>, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetOrderOrdersOrderIdGetKeyFn(clientOptions, queryKey), queryFn: () => getOrderOrdersOrderIdGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Search
*
* Общий поиск по маркетплейсу в рамках города.
*
* Возвращает товары (с фильтрами, релевантностью и пагинацией) и — если задан
* `q` — короткие подсказки: магазины города по названию, категории и бренды.
*/
export const useSearchSearchGetSuspense = <TData = NonNullable<Common.SearchSearchGetDefaultResponse>, TError = SearchSearchGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<SearchSearchGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseSearchSearchGetKeyFn(clientOptions, queryKey), queryFn: () => searchSearchGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Shops Statistics
*
* Количество магазинов с разбивкой по статусам регистрации (RegistrationStatus).
*/
export const useGetShopsStatisticsStatisticsShopsGetSuspense = <TData = NonNullable<Common.GetShopsStatisticsStatisticsShopsGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetShopsStatisticsStatisticsShopsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetShopsStatisticsStatisticsShopsGetKeyFn(clientOptions, queryKey), queryFn: () => getShopsStatisticsStatisticsShopsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Clients Statistics
*
* Количество клиентов — пользователей с флагом client=True.
*/
export const useGetClientsStatisticsStatisticsClientsGetSuspense = <TData = NonNullable<Common.GetClientsStatisticsStatisticsClientsGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetClientsStatisticsStatisticsClientsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetClientsStatisticsStatisticsClientsGetKeyFn(clientOptions, queryKey), queryFn: () => getClientsStatisticsStatisticsClientsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Get Orders Statistics
*
* Количество заказов с разбивкой по статусам (OrderStatusCode).
*/
export const useGetOrdersStatisticsStatisticsOrdersGetSuspense = <TData = NonNullable<Common.GetOrdersStatisticsStatisticsOrdersGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<GetOrdersStatisticsStatisticsOrdersGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseGetOrdersStatisticsStatisticsOrdersGetKeyFn(clientOptions, queryKey), queryFn: () => getOrdersStatisticsStatisticsOrdersGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Read Contact Us
*/
export const useReadContactUsContactUsGetSuspense = <TData = NonNullable<Common.ReadContactUsContactUsGetDefaultResponse>, TError = ReadContactUsContactUsGetError, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<ReadContactUsContactUsGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseReadContactUsContactUsGetKeyFn(clientOptions, queryKey), queryFn: () => readContactUsContactUsGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
/**
* Health Check
*/
export const useHealthCheckGetSuspense = <TData = NonNullable<Common.HealthCheckGetDefaultResponse>, TError = unknown, TQueryKey extends Array<unknown> = unknown[]>(clientOptions: Options<HealthCheckGetData, true> = {}, queryKey?: TQueryKey, options?: Omit<UseSuspenseQueryOptions<TData, TError>, "queryKey" | "queryFn">) => useSuspenseQuery<TData, TError>({ queryKey: Common.UseHealthCheckGetKeyFn(clientOptions, queryKey), queryFn: () => healthCheckGet({ ...clientOptions }).then(response => response.data as TData) as TData, ...options });
