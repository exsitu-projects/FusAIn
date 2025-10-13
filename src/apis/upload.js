import axios from "axios";

async function uploadFile(formData) {
  try {
    const data = await axios.post("http://localhost:3000/upload", formData);
    return {
      fileArr: data.data.files.map((v) => v.filename),
      dimensionArr: data.data.dimensionArr,
    };
  } catch (err) {
    alert(err.response.data.error);
  }
}

export { uploadFile };
