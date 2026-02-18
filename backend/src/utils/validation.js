const validator = require('validator');

const validateSignUpData = (req) => {
    const {firstName,lastName,emailId,password} = req.body;

    if (!firstName || !lastName) {
        throw new Error("Enter the valid name");
    } else if (!validator.isEmail(emailId)) {
        throw new Error("Email is not valid");
    } else if (!validator.isStrongPassword(password)) {
        throw new Error("Enter strong password");
    }
}
function validateEditProfileData(data) {
  if (!data || typeof data !== "object") return false;

  const allowedFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "age",
    "gender",
    "about",
    "skills"
  ];

  return Object.keys(data).every(field =>
    allowedFields.includes(field)
  );
}


module.exports = {
    validateSignUpData, validateEditProfileData
}