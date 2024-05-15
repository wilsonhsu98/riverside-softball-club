export const POST_URL =
  'https://script.google.com/macros/s/AKfycbzeX-rbegsYYlvkoGu6tyKKr9FtI5DnbSKjgL-RyHXSnisy2RY/exec';
export const TEDDY = '1O5mtJ3kb427w7jqqBtNGeIuxTRuDTKmQh4XbaPn9ncA';

export const GET_URL = parameters => {
  const params = parameters || {};
  const baseUrl =
    'https://script.google.com/macros/s/AKfycbzeX-rbegsYYlvkoGu6tyKKr9FtI5DnbSKjgL-RyHXSnisy2RY/exec';
  const fileId = params.fileId || '';
  const sheetname = params.sheetname || '';
  const action = params.action || '';
  return `${baseUrl}?fileId=${fileId}&sheetname=${sheetname}&action=${action}&${new Date().toString()}`;
};

const DELETE_ANNONYMOUS_USERS_URL =
  'https://riversidesoftballclub.netlify.app/.netlify/functions/index/delete_anonymous_users';
export const DELETE_ANNONYMOUS_USERS_URL_PROXY = `https://script.google.com/macros/s/AKfycbzwB6fT7ZHjlNENz9KwYqtOrWm6jV_DSnR5Vzvieyf1eSyIERbS/exec?url=${DELETE_ANNONYMOUS_USERS_URL}`;

export const PROVIDER = {
  google: 'google.com',
  fb: 'facebook.com',
  github: 'github.com',
  line: 'password',
};

export const PROVIDER_NAME_MAP = {
  [PROVIDER.google]: 'Google',
  [PROVIDER.fb]: 'FaceBook',
  [PROVIDER.github]: 'Github',
  [PROVIDER.line]: 'LINE',
};
