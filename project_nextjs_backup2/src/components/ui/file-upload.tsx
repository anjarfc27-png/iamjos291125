"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, File as FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

interface FileUploadProps {
    bucketName?: string;
    folderPath?: string;
    accept?: string;
    maxSizeMB?: number;
    defaultValue?: string;
    onUploadComplete?: (url: string) => void;
    name?: string; // For hidden input
    label?: string;
}

export function FileUpload({
    bucketName = "site-assets",
    folderPath = "uploads",
    accept = "image/*",
    maxSizeMB = 5,
    defaultValue = "",
    onUploadComplete,
    name,
    label = "Upload File",
}: FileUploadProps) {
    const [fileUrl, setFileUrl] = useState<string>(defaultValue);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const supabase = getSupabaseBrowserClient();

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await uploadFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await uploadFile(e.dataTransfer.files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        // Validate size
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`File size exceeds ${maxSizeMB}MB limit.`);
            return;
        }

        setIsUploading(true);
        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `${folderPath}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            setFileUrl(publicUrl);
            if (onUploadComplete) {
                onUploadComplete(publicUrl);
            }
            toast.success("File uploaded successfully");
        } catch (error: any) {
            console.error("Upload failed:", error);
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setFileUrl("");
        if (onUploadComplete) {
            onUploadComplete("");
        }
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const isImage = accept.startsWith("image/") || (fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl));

    return (
        <div className="w-full space-y-2">
            {name && <input type="hidden" name={name} value={fileUrl} />}

            {!fileUrl ? (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        accept={accept}
                        onChange={handleFileSelect}
                        disabled={isUploading}
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">{label}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Drag & drop or click to select (max {maxSizeMB}MB)
                            </p>
                        </>
                    )}
                </div>
            ) : (
                <div className="relative border rounded-lg p-2 bg-gray-50 flex items-center gap-4">
                    {isImage ? (
                        <div className="relative h-16 w-16 flex-shrink-0 bg-white rounded border overflow-hidden">
                            <Image
                                src={fileUrl}
                                alt="Uploaded file"
                                fill
                                className="object-contain"
                            />
                        </div>
                    ) : (
                        <div className="h-16 w-16 flex-shrink-0 bg-white rounded border flex items-center justify-center">
                            <FileIcon className="h-8 w-8 text-gray-400" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {fileUrl.split("/").pop()}
                        </p>
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                        >
                            View File
                        </a>
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-red-600"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
