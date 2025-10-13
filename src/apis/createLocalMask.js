async function createLocalMask(greyMaskBase64) {
  try {
    const response = await fetch("/send-local-area", {
      method: "POST", // or 'GET' depending on your use case
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        greyMaskBase64: greyMaskBase64,
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

export { createLocalMask };
