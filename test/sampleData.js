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
    is_favorite: true,
  },
  invalidEntry: {
    title: '5',
    content: 'Awesome Content',
    is_favorite: 5, // isFavorite should be boolean
  },
  incompleteValidEntry: {
    title: 'Cool Title',
    content: 'Lovely Content',
  },
  incompleteInvalidEntry: {
    is_favorite: 'true',
  },
  invalidEntryId: 0,
};

export default sampleData;
