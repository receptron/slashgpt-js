import * as fs from "fs";

export const base64Image = (imagePath: string) => {
  try {
    // Read the file as a binary buffer
    const imageBuffer = fs.readFileSync(imagePath);
    // Convert the buffer to a base64 string
    const base64String = imageBuffer.toString("base64");

    const imageType = getImageType(imageBuffer);
    return `data:image/${imageType};base64,${base64String}`;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
};

export const getImageType = (imageBuffer: Buffer) => {
  const head = Array.from(imageBuffer.slice(0, 8))
    .map((a) => {
      return ("00" + a.toString(16)).slice(-2);
    })
    .join("")
    .toLowerCase();
  if (head.startsWith("89504e470d0a1a0a")) {
    return "png";
  }
  if (head.startsWith("ffd8")) {
    return "jpeg";
  }
  return "unknown";
};
