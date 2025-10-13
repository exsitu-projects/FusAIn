//Note:
//NOT USED AT THE MOMENT
async function createCombinedMask(colorMaskPath, textureMaskPath) {
  try {
    const response = await fetch("/combined-mask", {
      method: "POST", // or 'GET' depending on your use case
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        colorMaskPath: colorMaskPath,
        textureMaskPath: textureMaskPath,
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

export { createCombinedMask };
