export const getIonInputClassNames = (isValid: boolean, isTouched: boolean) => {
  return `${isValid && 'ion-valid'} ${!isValid && 'ion-invalid'} ${
    isTouched && 'ion-touched'
  }`;
};
