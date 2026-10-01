import { MAX_PAGE_SIZE } from "@/constants/pagination";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import {
  Camera,
  CameraRef,
  Map,
  Marker,
} from "@maplibre/maplibre-react-native";
import { mapApi } from "@/api/mapApi";
import ActivityIndicator from "@/ui/ActivityIndicator";
import { pickupPointsApi } from "@/api/pickupPointsApi";
import { useUserStore } from "@/store/useUserStore";
import MapPinIcon from "@assets/icons/map-pin.svg";
import PickupPointDetailSheet from "@/components/BottomSheet/PickupPointDetail";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useTranslation } from "react-i18next";
import { usePickupPointStore } from "@/store/usePickupPointStore";
import { useRouter } from "expo-router";
import ArrowLeftIcon from "@assets/icons/arrow-left.svg";

const PickupMapScreen = () => {
  const mapStyleQuery = mapApi.useGetStyle();
  const cameraRef = useRef<CameraRef>(null);
  const selectedCityId = useUserStore((s) => s.cityId);
  const { t } = useTranslation();
  const [selectedPickupPoint, setSelectedPickupPoint] =
    useState<PickupPoint.Item | null>(null);
  const pickupPointDetailSheet = useRef<TrueSheet | null>(null);
  const router = useRouter();

  const pickupPointsQuery = pickupPointsApi.useGetAll(
    {
      limit: MAX_PAGE_SIZE,
      skip: 0,
      city_id: selectedCityId!,
      // Без фильтра на карте были и выключенные пункты — заказ в такой пункт
      // сервер не примет. Параметры те же, что на экране оформления: один кэш.
      is_active: true,
    },
    { enabled: !!selectedCityId },
  );

  const pickupPoints = pickupPointsQuery.data || [];

  useEffect(() => {
    if (selectedPickupPoint) {
      pickupPointDetailSheet.current?.present();
    }
  }, [selectedPickupPoint]);

  const handlePressMarker = (pickupPoint: PickupPoint.Item) => {
    setSelectedPickupPoint(pickupPoint);
    cameraRef.current?.flyTo({
      center: [Number(pickupPoint.longitude), Number(pickupPoint.latitude)],
      zoom: 15.5,
    });
  };
  const handleSave = (pickupPoint: PickupPoint.Item) => {
    usePickupPointStore.getState().selectPickupPoint(pickupPoint);
    pickupPointDetailSheet.current?.dismiss();
    router.back();
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <>
      {mapStyleQuery.isLoading || !mapStyleQuery.data ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator isFullScreen />
        </View>
      ) : (
        <Map mapStyle={mapStyleQuery.data as any} logo={false}>
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: [58.3794, 37.9509],
              zoom: 13.5,
            }}
          />
          {pickupPoints.map((pickupPoint) => (
            <Marker
              key={pickupPoint.id}
              hitSlop={8}
              onPress={() => handlePressMarker(pickupPoint)}
              lngLat={[
                Number(pickupPoint.longitude),
                Number(pickupPoint.latitude),
              ]}
            >
              <MapPinIcon width={42} height={52} />
            </Marker>
          ))}
        </Map>
      )}

      <Pressable
        onPress={handleGoBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
        hitSlop={8}
      >
        <ArrowLeftIcon width={24} height={24} style={styles.arrowIcon} />
      </Pressable>

      <PickupPointDetailSheet
        data={selectedPickupPoint}
        ref={pickupPointDetailSheet}
        onSave={handleSave}
        t={t}
      />
    </>
  );
};

export default PickupMapScreen;

const styles = StyleSheet.create((theme, rt) => ({
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundColor: "white",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: theme.spacing(99),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    position: "absolute",
    top: rt.insets.top + theme.spacing(2.5),
    left: theme.spacing(2.5),
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.stroke ?? "rgba(0, 0, 0, 0.1)",
    ...theme.shadows.soft,
  },
  backButtonPressed: {
    opacity: 0.6,
  },
  arrowIcon: {
    color: theme.colors.passive2,
  },
}));
