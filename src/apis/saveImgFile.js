async function saveImgFile(newImgUrl, imgSavePath) {
  try {
    const response = fetch("/save-img-file", {
      method: "POST", // or 'GET' depending on your use case
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        newImgUrl: newImgUrl,
        imgSavePath: imgSavePath,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then((data) => {
        return data;
      });
    return response;
  } catch (error) {
    console.error("Error:", error); // Handle errors here
  }
}

export { saveImgFile };
