const prettyPhoneNumber = (phoneNumber: number) => {
  if (String(phoneNumber).length < 11) {
    return phoneNumber;
  }
  const phoneString = phoneNumber.toString();

  const countryCode = phoneString.slice(0, 3);
  const areaCode = phoneString.slice(3, 5);
  const firstPart = phoneString.slice(5, 7);
  const secondPart = phoneString.slice(7, 9);
  const thirdPart = phoneString.slice(9);

  return `+${countryCode} ${areaCode} ${firstPart}${secondPart}${thirdPart}`;
};

export default prettyPhoneNumber;
