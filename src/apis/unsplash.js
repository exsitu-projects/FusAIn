async function searchUnsplash(query) {
  try {
    const response = await fetch("/unsplash", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    });
    let resultsPerPage = 30;
    let { total, results } = await response.json();

    resultsPerPage = Math.min(total, resultsPerPage);
    let imagesAttributes = [];

    for (let i = 0; i < resultsPerPage; i++) {
      let result = results[i];
      let tagArray = [];
      for (let j = 0; j < result.tags.length; j++) {
        const title = result.tags[j].title;
        if (title.length !== 1)
          tagArray.push(
            title
              .toLowerCase()
              .replace(/(^|\s)\S/g, (match) => match.toUpperCase()),
          );
      }

      imagesAttributes.push({
        id: result.id,
        description: result.description,
        tags: tagArray,
        url: result.urls.small,
        download_location: result.links.download_location,
      });
    }

    if (response.status !== 200) {
      throw new Error(imagesAttributes.error || "Image search failed");
    }
    return imagesAttributes;
  } catch (error) {
    console.error("Error:", error); // Handle errors here
  }
}

async function downloadImg(url) {
  try {
    const response = await fetch("/unsplash-download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
      }),
    });
    let data = await response;

    if (response.ok) {
      document.getElementById("success-message").style.display = "block";
      setTimeout(() => {
        document.getElementById("success-message").style.display = "none";
      }, 2000);
    } else {
      alert("Failed to download image.");
    }

    if (response.status !== 200) {
      throw new Error("Image download failed");
    }
    return data;
  } catch (error) {
    console.error("Error:", error); // Handle errors here
  }
}

export { searchUnsplash, downloadImg };
