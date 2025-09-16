import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface ReceiptUploadProps {
    file: File | null;
    setFile: (file: File | null) => void;
    disabled?: boolean;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ file, setFile, disabled }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors ${!disabled && 'hover:border-blue-400'}`}>
            <div className="space-y-1 text-center">
                {preview ? (
                     <img src={preview} alt="Preview" className="h-24 w-auto mx-auto rounded-md object-cover" loading="lazy" />
                ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="receipt-file-upload" className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}>
                        <span>{file ? 'تغيير الملف' : 'اختر ملفًا'}</span>
                        <input id="receipt-file-upload" name="receipt-file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} accept="image/*" required disabled={disabled} />
                    </label>
                    <p className="ps-1">{file ? file.name : 'أو اسحبه هنا'}</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
        </div>
    );
};

export default ReceiptUpload;
