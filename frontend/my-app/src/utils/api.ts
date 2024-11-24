import { parseSubtitlesFromZip, Subtitle } from "./subtitleParser";

const BASE_URL = "http://localhost:3001"
export const uploadFile = async (location:string,file:any) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${BASE_URL}${location}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

// Get File Status
export const getFileStatus = async (location:string) => {
  try {
    const response = await fetch(`${BASE_URL}${location}`, {
      method: "GET",
      
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("response failed:", error);
    throw error;
  }
};


export const pollFileStatus = async (statusUrl: string) => {
  const maxAttempts = 100; // Maximum number of attempts
  const delay = 10000; // Delay between polls (in milliseconds)

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const statusResponse = await getFileStatus(statusUrl);
      console.log(`Attempt ${attempt + 1}:`, statusResponse);

      if (statusResponse.status === "completed") {
        console.log("File processing completed.");
        return statusResponse; // Exit polling if completed
      }

      if (statusResponse.status === "error") {
        console.error("File processing encountered an error.");
        throw new Error("Processing failed.");
      }

     

      // Wait before the next poll
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      console.error("Error during polling:", error);
      throw error; // Stop polling if an error occurs
    }
  }

  // If maximum attempts reached
  console.error("Maximum polling attempts reached without completion.");
  throw new Error("Polling timeout.");
};



export const downloadFile = async (location:string): Promise<{zipBlob:Blob,subtitles:any}> => {
  const response = await fetch(`${BASE_URL}${location}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to download file with ID: ${location}`);
  }
  const zipBlob = await response.blob();
  const subtitles = await parseSubtitlesFromZip(new File([zipBlob], 'subtitles.zip'));
  return  {zipBlob,subtitles}// Return the file as a Blob
};

