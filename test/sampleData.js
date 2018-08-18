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
    email: 'john.dave3@gmail.com',
    password: 'nopassword',
  },
  incorrectUser2: {
    email: 'john.dave@gmail.com',
    password: 'nopassword',
  },
  invalidToken: 'invalid.token',
  validEntry: {
    title: 'Cool Title',
    content: 'Awesome content',
    is_favorite: false,
  },
  anotherValidEntry: {
    title: 'Another Cool Title',
    content: 'Another Awesome content',
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
  invalidEntryId: 'id',
  nonExistentId: 5,
  validProfile: {
    push_sub: JSON.stringify({ channel: 'foo' }),
  },
  invalidProfile: {
    reminder_set: '',
  },
  timestampNow: 1534258252771,
  justOverADay: 24 * 3600 * 1000 + 1,
};

export default sampleData;
