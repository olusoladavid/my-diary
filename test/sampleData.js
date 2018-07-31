const sampleData = {
  validUser: {
    email: 'john.dave@gmail.com',
    password: 'somepassword',
  },
  invalidUser: {
    email: 'name',
    password: null,
  },
  incorrectUser: {
    email: 'john.dave@gmail.com',
    password: 'nopassword',
  },
  invalidToken: 'invalid.token',
  validEntry: {
    title: 'Cool Title',
    content: 'Awesome content',
    isFavorite: true,
  },
  invalidEntry: {
    title: 5, // title should be a string
    content: 'Awesome Content',
    isFavorite: 'false', // isFavorite should be boolean
  },
  incompleteValidEntry: {
    title: 'Cool Title',
    content: 'Lovely Content',
  },
  incompleteInvalidEntry: {
    isFavorite: 'true',
  },
  invalidEntryId: 0,
};

export default sampleData;
