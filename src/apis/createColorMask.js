//Note:
//NOT USED AT THE MOMENT
async function createColorMask(colorMaskBase64) {
  try {
    const response = await fetch("/send-color-mask", {
      method: "POST", // or 'GET' depending on your use case
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        colorMaskBase64: colorMaskBase64,
      }),
    });

    const data = await response.json();
    if (response.status !== 200) {
      throw new Error(data.error || "Image generation failed");
    }

    return data;
  } catch (error) {
    console.error(error);
    return "";
  }
}

export { createColorMask };
