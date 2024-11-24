import React from 'react';
import { Download, FileVideo, Languages } from 'lucide-react';
import { FileStatus } from './FileStatus';
import { downloadFile} from "@/utils/api"

interface FileItem {
  id?: string;
  name: string;
  status: 'processing' | 'completed' | 'error';
  language: string;
  statusUrl?:string;
  
}

interface ProcessingTableProps {
  files: FileItem[];
  downloadUrl?:string ;
  onSubtitlesReceived?: (subtitles: any) => void
}


export function ProcessingTable({ files ,downloadUrl,onSubtitlesReceived}: ProcessingTableProps) {
  const handleDownload = async (file:FileItem,downloadUrl?: string) => {
    try {
      // Fetch the file from the server
      const {zipBlob,subtitles} = await downloadFile(downloadUrl!);
      console.log(subtitles);
      
      if (onSubtitlesReceived) {
        console.log("on subtitle recieved");
        
        onSubtitlesReceived(subtitles);
      }
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

      console.log(`File ${file.name} downloaded successfully.`);
    } catch (error) {
      console.error(`Error downloading file ${file.name}:`, error);
    }
  };

  return (
    <div className="bg-black rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              File
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Language
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Status
            </th>
            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Progress
            </th> */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-black text-white divide-y divide-gray-200">
          {files.map((file) => (
            <tr key={file.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FileVideo className="w-5 h-5 text-gray-100 mr-2" />
                  <span className="text-sm text-gray-100">{file.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Languages className="w-5 h-5 text-gray-100 mr-2" />
                  <span className="text-sm text-gray-100">{file.language}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <FileStatus status={file.status} />
              </td>
              {/* <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${file.progress}%` }}
                  ></div>
                </div>
              </td> */}
              <td className="px-6 py-4 whitespace-nowrap">
                <button 
                  className={`
                    inline-flex items-center px-3 py-1 rounded-lg text-sm
                    ${file.status === 'completed' 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                  `}
                  disabled={file.status !== 'completed'}
                  onClick={()=>handleDownload(file,downloadUrl)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}