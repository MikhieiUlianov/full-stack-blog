import { useRef } from "react";
import { toast } from "react-toastify";
import { upload, UploadResponse } from "@imagekit/react";

const Upload = ({
  setProgress,
  onUploadSuccess,
  accept,
  children,
}: {
  setProgress: (number: number) => void;
  onUploadSuccess: (data: UploadResponse) => void;
  accept: string;
  children: React.ReactNode;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortController = new AbortController();

  const authenticator = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/posts/upload-auth`
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }
    return await response.json();
  };

  const handleUpload = async (file: File) => {
    let authParams;
    try {
      authParams = await authenticator();
    } catch {
      toast.error("Auth failed!");
      return;
    }

    const { signature, expire, token, publicKey } = authParams;

    try {
      const result = await upload({
        expire,
        token,
        signature,
        publicKey,
        file,
        fileName: file.name,
        onProgress: (event) => {
          setProgress((event.loaded / event.total) * 100);
        },
        abortSignal: abortController.signal,
      });

      if (result) onUploadSuccess(result);

      toast.success("File uploaded!");
    } catch (error) {
      toast.error("File upload failed!");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer"
      >
        {children}
      </div>
    </>
  );
};

export default Upload;
