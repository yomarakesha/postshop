import React from 'react'
import { ScrollView, View } from 'react-native'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles'
import { useTranslation } from 'react-i18next'
import Header from '@/components/Header'
import Typography from '@/ui/Typography'
import LocationIcon from '@assets/icons/location.svg'
import CallIcon from '@assets/icons/call.svg'
import Svg, { Path } from 'react-native-svg'

type Section = {
  title: string
  body: string
}

const MailIcon = ({
  color,
  width,
  height,
  style,
}: {
  color?: string
  width?: number
  height?: number
  style?: any
}) => (
  <Svg width={width ?? 18} height={height ?? 18} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8M5 19H19C20.1 19 21 18.1 21 17V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19Z"
      stroke={color ?? 'currentColor'}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
)

const PrivacyPolicyScreen = () => {
  const { t } = useTranslation()
  const theme = UnistylesRuntime.getTheme()

  const sections = t('profile.privacyPolicy.sections', {
    returnObjects: true,
  }) as Section[]

  const contactTitle = t('profile.privacyPolicy.contacts.title')
  const addressLabel = t('profile.privacyPolicy.contacts.address.label')
  const addressValue = t('profile.privacyPolicy.contacts.address.value')
  const phoneLabel = t('profile.privacyPolicy.contacts.phone.label')
  const phoneValue = t('profile.privacyPolicy.contacts.phone.value')
  const emailLabel = t('profile.privacyPolicy.contacts.email.label')
  const emailValue = t('profile.privacyPolicy.contacts.email.value')

  return (
    <>
      <Header title={t('profile.privacyPolicy.headerTitle')} withGoBack backgroundColor="white" />
      <ScrollView
        style={styles.wrapper}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {Array.isArray(sections) &&
          sections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Typography variant="p2" weight="semiBold" style={styles.sectionTitle}>
                {section.title}
              </Typography>
              <Typography variant="p3" color="secondary" style={styles.sectionBody}>
                {section.body}
              </Typography>
            </View>
          ))}

        <View style={styles.divider} />

        <View style={styles.contactsWrapper}>
          <Typography variant="p2" weight="semiBold" style={styles.contactsMainTitle}>
            {contactTitle}
          </Typography>

          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <LocationIcon width={18} height={18} style={styles.contactIcon} />
              <Typography variant="p2" weight="semiBold" style={styles.contactLabel}>
                {addressLabel}
              </Typography>
            </View>
            <Typography variant="p3" color="secondary" style={styles.contactValue}>
              {addressValue}
            </Typography>
          </View>

          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <CallIcon width={18} height={18} style={styles.contactIcon} />
              <Typography variant="p2" weight="semiBold" style={styles.contactLabel}>
                {phoneLabel}
              </Typography>
            </View>
            <Typography variant="p3" color="secondary" style={styles.contactValue}>
              {phoneValue}
            </Typography>
          </View>

          <View style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <MailIcon
                width={18}
                height={18}
                style={styles.contactIcon}
                color={theme.colors.blueMain}
              />
              <Typography variant="p2" weight="semiBold" style={styles.contactLabel}>
                {emailLabel}
              </Typography>
            </View>
            <Typography variant="p3" color="secondary" style={styles.contactValue}>
              {emailValue}
            </Typography>
          </View>
        </View>
      </ScrollView>
    </>
  )
}

export default PrivacyPolicyScreen

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  contentContainer: {
    padding: theme.spacing(4),
    gap: theme.spacing(5),
    paddingBottom: theme.spacing(10),
  },
  section: {
    gap: theme.spacing(2),
  },
  sectionTitle: {
    lineHeight: 22,
  },
  sectionBody: {
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.stroke,
    marginVertical: theme.spacing(2),
  },
  contactsWrapper: {
    gap: theme.spacing(4),
  },
  contactsMainTitle: {
    marginBottom: theme.spacing(1),
  },
  contactCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing(4),
    padding: theme.spacing(4),
    gap: theme.spacing(3),
    borderWidth: 1,
    borderColor: theme.colors.stroke,
    ...theme.shadows.soft,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2.5),
  },
  contactIcon: {
    color: theme.colors.blueMain,
  },
  contactLabel: {
    lineHeight: 22,
  },
  contactValue: {
    lineHeight: 22,
    paddingLeft: theme.spacing(7),
  },
}))
