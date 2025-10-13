async function extractLasso(
  maskId,
  partId,
  maskUrl,
  extractPayload,
  imgWidth,
  imgHeight,
) {
  try {
    const response = await fetch("/send-semi-mask", {
      method: "POST", // or 'GET' depending on your use case
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maskId: maskId,
        partId: partId,
        maskUrl: maskUrl,
        extractPayload: extractPayload,
        imgWidth: parseInt(imgWidth),
        imgHeight: parseInt(imgHeight),
      }),
    });

    const data = await response.json();
    if (response.status !== 200) {
      throw new Error(data.error || "Image generation failed");
    }
    return data;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export { extractLasso };
