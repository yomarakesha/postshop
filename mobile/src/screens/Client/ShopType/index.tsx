import { shopBaseApi } from '@/api/shopBaseApi'
import Header from '@/components/Header'
import ActivityIndicator from '@/ui/ActivityIndicator'
import Button from '@/ui/Button'
import ScreenFooter from '@/ui/ScreenFooter'
import Typography from '@/ui/Typography'
import ShopMainIcon from '@assets/icons/shop-main.svg'
import ShopNeutralIcon from '@assets/icons/shop-neutral.svg'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { StyleSheet, useUnistyles } from 'react-native-unistyles'

const ShopTypeScreen = () => {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<ShopBase.Type | undefined>(undefined)
  const shopCreateMutation = shopBaseApi.useCreate()
  const { theme } = useUnistyles()
  const { t } = useTranslation()

  const typeData: { key: ShopBase.Type; title: string }[] = [
    {
      key: 'individual_entrepreneur',
      title: t('client.sellerType.individual'),
    },
    {
      key: 'legal_entity',
      title: t('client.sellerType.legalEntity'),
    },
  ]

  const handleSelectType = (type: ShopBase.Type) => {
    setSelectedType(type)
  }

  const handleNext = async () => {
    if (!selectedType) return
    try {
      const res = await shopCreateMutation.mutateAsync({
        legal_entity_type: selectedType,
        documents: [],
      })

      router.push({
        pathname: '/(become-seller)/[type]',
        params: {
          type: selectedType,
          shopId: res.id,
        },
      })
    } catch {
      return
    }
  }
  return (
    <>
      <Header
        withGoBack
        title={t('client.sellerType.headerTitle')}
        backgroundColor={theme.colors.white}
      />
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {typeData.map((item, index) => (
            <Pressable
              key={index}
              onPress={() => handleSelectType(item.key)}
              style={styles.card(item.key === selectedType)}
              accessibilityRole="radio"
              accessibilityState={{ selected: item.key === selectedType }}
            >
              <View style={styles.badge(item.key === selectedType)}>
                {item.key === selectedType ? (
                  <ShopNeutralIcon width={32} height={32} style={styles.shopSolid} />
                ) : (
                  <ShopMainIcon width={32} height={32} style={styles.shopOutline} />
                )}
              </View>
              <View style={styles.cardTextContainer}>
                <Typography variant="p3" weight="semiBold" isCentered>
                  {item.title}
                </Typography>
              </View>
            </Pressable>
          ))}
        </View>
        <ScreenFooter>
          <Button
            title={t('common.next')}
            onPress={handleNext}
            disabled={!selectedType || shopCreateMutation.isPending}
            variant="primary"
          >
            {shopCreateMutation.isPending ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : undefined}
          </Button>
        </ScreenFooter>
      </View>
    </>
  )
}

export default ShopTypeScreen

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
  },
  container: {
    margin: theme.spacing(4),
    padding: theme.spacing(4),
    gap: theme.spacing(6),
    borderRadius: theme.spacing(3),
    backgroundColor: theme.colors.white,
  },
  card: (isActive: boolean) => ({
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    borderRadius: theme.spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isActive ? theme.colors.blueMain : theme.colors.stroke,
    // Выбранный вариант отличался только цветом рамки в 1px — на телефоне
    // это почти не читается, поэтому добавлена заливка.
    backgroundColor: isActive ? theme.colors.blue1 : theme.colors.white,
  }),
  cardTextContainer: {
    gap: theme.spacing(2),
  },
  badge: (isActive: boolean) => ({
    backgroundColor: isActive ? theme.colors.blue2 : theme.colors.gray2,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  shopOutline: {
    color: theme.colors.passive2,
  },
  shopSolid: {
    color: theme.colors.blueMain,
  },
}))
