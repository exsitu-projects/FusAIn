import axios from "axios";
const SD_T2I_URL = "http://127.0.0.1:7860/sdapi/v1/txt2img"
const SD_I2I_URL = "http://127.0.0.1:7860/sdapi/v1/img2img"

async function generateT2I(payload) {
  try {
    const response = await axios.post(SD_T2I_URL, payload, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
    });

    if (response.status !== 200) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    const imageData = await response.data;
    response.status = 200;
    console.log("generated image processed successfully");
    return "data:image/png;base64," + imageData.images[0];
  } catch (error) {
    error.status = 500;
    console.error("Error making the request:", error);
    return "Error generating image";
  }
}

async function generateI2I(payload) {
  try {
    const response = await axios.post(SD_I2I_URL, payload, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    });

    if (response.status !== 200) {
      throw new Error(`Server responded with status ${response.status}`);
    }
    const imageData = await response.data;
    response.status = 200;
    console.log("generated image processed successfully");
    return "data:image/png;base64," + imageData.images[0];
  } catch (error) {
    error.status = 500;
    console.error("Error making the request:", error.response.data);
    return error;
  }
}
export { generateT2I, generateI2I };
