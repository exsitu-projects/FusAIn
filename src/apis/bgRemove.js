async function removeBgNode(imgSource) {
  try {
    const response = await fetch("/bg-remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imgSource: imgSource,
      }),
    });
    let data = await response;

    if (response.ok) {
      return data;
    } else {
      alert("Failed to download image.");
    }
  } catch (error) {
    console.error("Error:", error); // Handle errors here
  }
}

export { removeBgNode };
