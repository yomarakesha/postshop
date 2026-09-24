import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'

import { MainLayout } from './layouts/MainLayout'
import { ProfileProvider } from './providers/ProfileProvider'
import { CreateBannerPage } from '@/pages/banner-create'
import { EditBannerPage } from '@/pages/banner-edit'
import { BannersPage } from '@/pages/banners'
import { BecomeStoreRequestDetailPage } from '@/pages/become-store-request-detail'
import { BecomeStoreRequestsPage } from '@/pages/become-store-requests'
import { CreateBrandPage } from '@/pages/brand-create'
import { EditBrandPage } from '@/pages/brand-edit'
import { BrandsPage } from '@/pages/brands'
import { CategoriesPage } from '@/pages/categories'
import { CreateCategoryPage } from '@/pages/category-create'
import { EditCategoryPage } from '@/pages/category-edit'
import { CitiesPage } from '@/pages/cities'
import { CreateCityPage } from '@/pages/city-create'
import { EditCityPage } from '@/pages/city-edit'
import { CreateCollectionPage } from '@/pages/collection-create'
import { EditCollectionPage } from '@/pages/collection-edit'
import { CollectionsPage } from '@/pages/collections'
import { ContactUsRequestsPage } from '@/pages/contact-us-requests'
import { CountriesPage } from '@/pages/countries'
import { CreateCountryPage } from '@/pages/country-create'
import { EditCountryPage } from '@/pages/country-edit'
import { CurrenciesPage } from '@/pages/currencies'
import { CreateCurrencyPage } from '@/pages/currency-create'
import { EditCurrencyPage } from '@/pages/currency-edit'
import { DeliveryMessagePage } from '@/pages/delivery-message'
import { GoodsReceivingPage } from '@/pages/goods-receiving'
import { CreateGoodsReceivingPage } from '@/pages/goods-receiving-create'
import { GoodsReceivingDetailPage } from '@/pages/goods-receiving-detail'
import { HomePage } from '@/pages/home'
import { LoginPage } from '@/pages/login'
import { CreateMeasureUnitPage } from '@/pages/measure-unit-create'
import { EditMeasureUnitPage } from '@/pages/measure-unit-edit'
import { MeasureUnitsPage } from '@/pages/measure-units'
import { NotFoundPage } from '@/pages/not-found'
import { OrderDetailPage } from '@/pages/order-detail'
import { OrdersPage } from '@/pages/orders'
import { CreatePickupPointPage } from '@/pages/pickup-point-create'
import { EditPickupPointPage } from '@/pages/pickup-point-edit'
import { PickupPointsPage } from '@/pages/pickup-points'
import { ProductModerationPage } from '@/pages/product-moderation'
import { ProductModerationDetailPage } from '@/pages/product-moderation-detail'
import { CreateRegionPage } from '@/pages/region-create'
import { EditRegionPage } from '@/pages/region-edit'
import { RegionsPage } from '@/pages/regions'
import { ReturnRequestsPage } from '@/pages/return-requests'
import { ReviewModerationPage } from '@/pages/review-moderation'
import { StoreDetailPage } from '@/pages/store-detail'
import { StoresPage } from '@/pages/stores'
import { CreateUserPage } from '@/pages/user-create'
import { EditUserPage } from '@/pages/user-edit'
import { UsersPage } from '@/pages/users'
import { CreateWarehousePage } from '@/pages/warehouse-create'
import { WarehouseDetailPage } from '@/pages/warehouse-detail'
import { EditWarehousePage } from '@/pages/warehouse-edit'
import { WarehousesPage } from '@/pages/warehouses'
import { RequireFbo } from '@/shared/lib/RequireFbo'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <ProfileProvider>
              <MainLayout />
            </ProfileProvider>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/create" element={<CreateCategoryPage />} />
          <Route path="categories/:id/edit" element={<EditCategoryPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="brands/create" element={<CreateBrandPage />} />
          <Route path="brands/:id/edit" element={<EditBrandPage />} />
          <Route path="cities" element={<CitiesPage />} />
          <Route path="cities/create" element={<CreateCityPage />} />
          <Route path="cities/:id/edit" element={<EditCityPage />} />
          <Route path="regions" element={<RegionsPage />} />
          <Route path="regions/create" element={<CreateRegionPage />} />
          <Route path="regions/:id/edit" element={<EditRegionPage />} />
          <Route path="countries" element={<CountriesPage />} />
          <Route path="countries/create" element={<CreateCountryPage />} />
          <Route path="countries/:id/edit" element={<EditCountryPage />} />
          <Route path="currencies" element={<CurrenciesPage />} />
          <Route path="currencies/create" element={<CreateCurrencyPage />} />
          <Route path="currencies/:id/edit" element={<EditCurrencyPage />} />
          <Route path="measure-units" element={<MeasureUnitsPage />} />
          <Route path="measure-units/create" element={<CreateMeasureUnitPage />} />
          <Route path="measure-units/:id/edit" element={<EditMeasureUnitPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/create" element={<CreateUserPage />} />
          <Route path="users/:id/edit" element={<EditUserPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="banners/create" element={<CreateBannerPage />} />
          <Route path="banners/:id/edit" element={<EditBannerPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="collections/create" element={<CreateCollectionPage />} />
          <Route path="collections/:id/edit" element={<EditCollectionPage />} />
          <Route path="delivery-message" element={<DeliveryMessagePage />} />
          <Route path="contact-us" element={<ContactUsRequestsPage />} />
          <Route
            path="warehouses"
            element={
              <RequireFbo>
                <WarehousesPage />
              </RequireFbo>
            }
          />
          <Route
            path="warehouses/create"
            element={
              <RequireFbo>
                <CreateWarehousePage />
              </RequireFbo>
            }
          />
          <Route
            path="warehouses/:id"
            element={
              <RequireFbo>
                <WarehouseDetailPage />
              </RequireFbo>
            }
          />
          <Route
            path="warehouses/:id/edit"
            element={
              <RequireFbo>
                <EditWarehousePage />
              </RequireFbo>
            }
          />
          <Route
            path="goods-receiving"
            element={
              <RequireFbo>
                <GoodsReceivingPage />
              </RequireFbo>
            }
          />
          <Route
            path="goods-receiving/create"
            element={
              <RequireFbo>
                <CreateGoodsReceivingPage />
              </RequireFbo>
            }
          />
          <Route
            path="goods-receiving/:id"
            element={
              <RequireFbo>
                <GoodsReceivingDetailPage />
              </RequireFbo>
            }
          />
          <Route path="pickup-points" element={<PickupPointsPage />} />
          <Route path="pickup-points/create" element={<CreatePickupPointPage />} />
          <Route path="pickup-points/:id/edit" element={<EditPickupPointPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="stores/:id" element={<StoreDetailPage />} />
          <Route path="become-store-requests" element={<BecomeStoreRequestsPage />} />
          <Route path="become-store-requests/:id" element={<BecomeStoreRequestDetailPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="product-moderation" element={<ProductModerationPage />} />
          <Route path="review-moderation" element={<ReviewModerationPage />} />
          <Route path="return-requests" element={<ReturnRequestsPage />} />
          <Route path="product-moderation/:id" element={<ProductModerationDetailPage />} />
          {/* Два экрана были англоязычными заглушками <div>Profile</div> и
              <div>Account Settings</div>, на которые не вело ни одной ссылки.
              Удалены: настройки профиля администратора в админке не
              предусмотрены. */}
        </Route>
        {/* Неизвестный адрес отдавал полностью пустую страницу — маршрута-
            заглушки не было. */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  )
}
