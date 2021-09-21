const isValidEmail = (email) => {
  const emailRegExp = new RegExp(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/, 'i');
  const isValid = emailRegExp.test(email);
  return isValid;
};

const isValidPassword = (password) => {
  // Minimum eight characters, at least one uppercase letter, one lowercase letter,
  // one number, not symbols
  const passRegExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);
  const isValidPass = passRegExp.test(password);
  return isValidPass;
};

const isCorrectIdOrEmail = (parameter) => {
  const idValidateRegex = new RegExp(/^[0-9a-fA-F]{24}$/);
  const emailRegExp = new RegExp(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/, 'i');
  const isMongoIdValid = idValidateRegex.test(parameter);
  const isEmailValid = emailRegExp.test(parameter);

  if (isMongoIdValid) return { _id: parameter };

  if (isEmailValid) return { email: parameter };

  return { message: 'id or email format incorrect' };
};

const isCorrectId = (parameter) => {
  const idValidateRegex = new RegExp(/^[0-9a-fA-F]{24}$/, 'g');
  const isMongoIdValid = idValidateRegex.test(parameter);

  if (isMongoIdValid) return { _id: parameter };

  return { message: 'id format incorrect' };
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isCorrectIdOrEmail,
  isCorrectId,
};
