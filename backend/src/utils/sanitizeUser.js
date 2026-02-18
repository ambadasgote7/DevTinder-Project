const sanitizeUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  emailId: user.emailId,
  role: user.role,
  photoUrl: user.photoUrl,
  age: user.age,
  gender: user.gender,
  about: user.about,
  skills: user.skills,
  isBlocked: user.isBlocked,
  createdAt: user.createdAt
});

module.exports = sanitizeUser;
