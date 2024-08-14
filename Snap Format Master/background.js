// Polyfill to support browser API in Chrome
if (typeof browser === "undefined") {
  var browser = chrome;
}

// Listener for when the extension is installed
browser.runtime.onInstalled.addListener(() => {
  // Create the main context menu item for saving images
  browser.contextMenus.create({
    id: "saveAsType",
    title: "Snap Format Master - Save Image As",
    contexts: ["image"],
  });

  // List of image formats to be added as submenu items
  const formats = ["jpg", "png", "gif", "webp"];
  formats.forEach((format) => {
    browser.contextMenus.create({
      id: `saveAs${format.toUpperCase()}`, // Unique ID for each format
      parentId: "saveAsType", // Parent ID to group under the main context menu
      title: format.toUpperCase(), // Display name for each format
      contexts: ["image"], // Context to show this menu item
    });
  });

  // Add a separator to visually separate format options from the GitHub link
  browser.contextMenus.create({
    id: "separator",
    type: "separator",
    parentId: "saveAsType",
    contexts: ["image"],
  });

  // Add a GitHub link to the context menu
  browser.contextMenus.create({
    id: "github",
    parentId: "saveAsType",
    title: "Irfan Nizamani - Github",
    contexts: ["image"],
  });
});

// Listener for context menu item clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId.startsWith("saveAs")) {
   
    // Extract the format from the clicked menu item ID
    const format = info.menuItemId.replace("saveAs", "").toLowerCase();

    // Execute the downloadImage function on the current tab
    browser.scripting.executeScript({
      target: { tabId: tab.id },
      function: downloadImage,
      args: [info.srcUrl, format], // Pass the image URL and format as arguments
    });
  }

  if (info.menuItemId === "github") {
    // Open the GitHub page in a new tab
    browser.tabs.create({ url: "https://github.com/irfannizamani" });
  }
});

// Function to download the image with the specified format
function downloadImage(url, format) {
  const image = new Image();
  image.crossOrigin = "Anonymous"; // Handle CORS issues

  // Error handling for image loading
  image.onerror = function () {
    console.error("Failed to load the image:", url);
    // Optionally, you can display an alert or notification here
  };

  image.onload = function () {
    
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions to match the image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0);

    // Convert the canvas content to the desired format
    canvas.toBlob((blob) => {
      const link = document.createElement("a"); // Create a temporary link element

      // Extract the original filename from the URL
      const originalFilename = url.substring(url.lastIndexOf("/") + 1);

      // Construct the new filename with "SnapFormatMaster_" prefix
      const newFilename = `SnapFormatMaster_${originalFilename
        .split(".")
        .slice(0, -1)
        .join(".")}.${format}`;

      link.href = URL.createObjectURL(blob); // Create a URL for the Blob
      link.download = newFilename; // Set the new filename for download
      document.body.appendChild(link); // Append the link to the document
      link.click(); // Programmatically click the link to start the download
      document.body.removeChild(link); // Remove the link from the document
      URL.revokeObjectURL(link.href); // Revoke the Blob URL
    }, `image/${format}`); // Specify the desired format
  };

  // Set the image source to start loading
  image.src = url;
}
