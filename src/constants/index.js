export const POST_URL =
  "https://script.google.com/macros/s/AKfycbzeX-rbegsYYlvkoGu6tyKKr9FtI5DnbSKjgL-RyHXSnisy2RY/exec";
export const TEDDY = "1O5mtJ3kb427w7jqqBtNGeIuxTRuDTKmQh4XbaPn9ncA";

export const GET_URL = function(params) {
  params = params || {};
  const baseUrl =
    "https://script.google.com/macros/s/AKfycbzeX-rbegsYYlvkoGu6tyKKr9FtI5DnbSKjgL-RyHXSnisy2RY/exec";
  const fileId = params.fileId || "";
  const sheetname = params.sheetname || "";
  const action = params.action || "";
  return `${baseUrl}?fileId=${fileId}&sheetname=${sheetname}&action=${action}&${new Date().toString()}`;
};
