const isValidEmail = (email) => {
  const emailRegExp = new RegExp(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/, 'i');
  const isValid = emailRegExp.test(email);
  return isValid;
};

const isValidPassword = (password) => {
  // Minimum eight characters, at least one uppercase letter, one lowercase letter,
  // one number, not symbols
  const emailRegExp = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);
  const isValidPass = emailRegExp.test(password);
  return isValidPass;
};

module.exports = {
  isValidEmail,
  isValidPassword,
};
