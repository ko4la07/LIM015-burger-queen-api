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

  // return { message: 'id format incorrect' };
};

const pages = (collection, url, limit, page, totalPages) => {
  const links = {
    first: `${url}?limit=${limit}&page=1`,
    prev: collection.hasPrevPage ? `${url}?limit=${limit}&page=${page - 1}` : `${url}?limit=${limit}&page=${page}`,
    next: collection.hasNextPage ? `${url}?limit=${limit}&page=${page + 1}` : `${url}?limit=${limit}&page=${totalPages}`,
    last: `${url}?limit=${limit}&page=${totalPages}`,
  };
  return links;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isCorrectIdOrEmail,
  isCorrectId,
  pages,
};
