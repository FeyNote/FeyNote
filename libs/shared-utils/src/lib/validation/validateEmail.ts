export const validateEmail = (email: string) => {
  // regex taken from default html input email validation behavior (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation)
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    email,
  );
};
