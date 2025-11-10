const imageKit = require("imagekit");

const imagekit = new imageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
  privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
});

async function uploadFile(file, fileName) {
  const result = await imagekit.upload({
    file: file, // required
    fileName: fileName, // required
  });
  return result; // returns the url of the uploaded file
}

module.exports = {
  uploadFile,
};
