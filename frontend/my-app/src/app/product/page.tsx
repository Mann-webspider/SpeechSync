"use client";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import { Upload, FileVideo, Languages, Download, Loader2 } from "lucide-react";
import Dropzone from "react-dropzone";
import { ProcessingTable } from "@/components/ProcessingTable";
import { Playground } from "@/components/Playground";
import { uploadFile, getFileStatus, pollFileStatus, downloadFile } from "@/utils/api";
// import { FileStatus, Header, ProcessingTable } from '@/components';
import { parseSubtitlesFromZip, Subtitle } from "@/utils/subtitleParser";

interface FileItem {
  id?: string;
  name: string;
  status: "processing" | "completed" | "error";
  language: string;
  statusUrl?: string;
  mediaUrl?: string;
  subtitles?: Subtitle[];
}
// Sample subtitles for demonstration
const sampleSubtitles = [
  { id: 1, startTime: 0, endTime: 3, text: "Hello, welcome to our video!" },
  {
    id: 2,
    startTime: 4,
    endTime: 7,
    text: "Today we'll be discussing SpeechSync",
  },
  {
    id: 3,
    startTime: 8,
    endTime: 12,
    text: "An amazing tool for generating subtitles",
  },
];

function product() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const handleSubtitlesReceived = (subtitles: any) => {
    // Process the received subtitles data (e.g., display them)

    setFiles((prev) =>
      prev.map((f) =>
        f.id === f.id ? { ...f, subtitles: subtitles } : f
      )
    );
    console.log("Subtitles received:", subtitles);
  };


  const handleDownload = async (downloadUrl?: string) => {
    try {
      // Fetch the file from the server
      const {zipBlob,subtitles} = await downloadFile(downloadUrl!);
      console.log(subtitles);
      
      handleSubtitlesReceived(subtitles)
      // Create a URL for the file blob
      const blobUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      // link.setAttribute('download', file.name); // Use the file's original name
      document.body.appendChild(link);
      link.click();

      // Clean up the URL object
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      console.log(`File  downloaded successfully.`);
    } catch (error) {
      console.error(`Error downloading file:`, error);
    }
  };
  const handleDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return; // Ensure there's at least one file

    const file = acceptedFiles[0]; // Only take the first file
    const mediaUrl = URL.createObjectURL(file);

    const newFile = {
      id: undefined,
      name: file.name,
      status: "processing" as const,
      language: "English",
      statusUrl: undefined,
      mediaUrl,
    };

    // Add the file to the state
    setFiles((prev) => [...prev, newFile]);

    try {
      // Upload the file via API
      const response = await uploadFile("/api/translate", file); // Call the API to upload the file
      console.log("File uploaded successfully:", response);
      console.log(file);

      //update taskId
      setFiles((prev) =>
        prev.map((f) =>
          f.name === file.name ? { ...f, id: response.taskId } : f
        )
      );
      console.log(files);

      // Short polling to check processing status
      const responseZip = await pollFileStatus(response.statusUrl);
      console.log("after polling line");
      console.log(responseZip);

      // Update the download URL in state
      setDownloadUrl(responseZip.downloadUrl);
      
      // Use the updated downloadUrl directly from responseZip for immediate logging or further use
      console.log("Download URL:", downloadUrl);
      handleDownload(responseZip.downloadUrl)
      // Update the file status to "completed"
      setFiles((prev) =>
        prev.map((f) =>
          f.name === file.name ? { ...f, status:responseZip.status } : f
        )
      );

      // Optionally fetch processing status
      // const statusResponse = await getFileStatus(response.statusUrl);
      // console.log("File processing status:", statusResponse);
    } catch (error) {
      // Handle errors and update the file status to "error"
      setFiles((prev) =>
        prev.map((f) => (f.id === newFile.id ? { ...f, status: "error" } : f))
      );
      console.error(`Error uploading file ${newFile.name}:`, error);
    }
  };

  return (
    <div className="container mx-auto">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Dropzone onDrop={handleDrop}>
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
                  transition-colors duration-200 ease-in-out
                  ${
                    isDragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center space-y-4">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <div>
                    <p className="text-xl font-medium text-gray-300">
                      Drop your video or audio files here
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Supports MP4, MOV, MP3, WAV up to 100MB
                    </p>
                  </div>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Select Files
                  </button>
                </div>
              </div>
            )}
          </Dropzone>

          {files.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-300 mb-4">
                Processing Queue
              </h2>
              <ProcessingTable files={files} downloadUrl={downloadUrl}  onSubtitlesReceived={handleSubtitlesReceived}/>
            </div>
          )}
          {/* Playground Section */}
          {files.some((f) => f.status === "completed") && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Subtitle Playground
              </h2>
              <Playground
                mediaUrl={files[0].mediaUrl}
                subtitles={files[0].subtitles}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default product;
