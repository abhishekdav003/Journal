import { createContext, useContext, useState } from "react";

const UploadContext = createContext();

export function UploadProvider({ children }) {
  const [uploads, setUploads] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadError, setUploadError] = useState(null);

  const addUpload = (uploadId, file) => {
    setUploads((prev) => [...prev, { id: uploadId, file, status: "uploading" }]);
    setUploadProgress((prev) => ({ ...prev, [uploadId]: 0 }));
  };

  const updateProgress = (uploadId, progress) => {
    setUploadProgress((prev) => ({ ...prev, [uploadId]: progress }));
  };

  const completeUpload = (uploadId) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === uploadId ? { ...upload, status: "completed" } : upload,
      ),
    );
    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[uploadId];
      return updated;
    });
  };

  const removeUpload = (uploadId) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== uploadId));
    setUploadProgress((prev) => {
      const updated = { ...prev };
      delete updated[uploadId];
      return updated;
    });
  };

  const clearError = () => {
    setUploadError(null);
  };

  const value = {
    uploads,
    uploadProgress,
    uploadError,
    setUploadError,
    addUpload,
    updateProgress,
    completeUpload,
    removeUpload,
    clearError,
  };

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within UploadProvider");
  }
  return context;
}
