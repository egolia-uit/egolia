'use client';

export function putFileToSignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('PUT', uploadUrl);
    request.setRequestHeader(
      'Content-Type',
      file.type || 'application/octet-stream'
    );

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    request.onerror = () => {
      reject(
        new Error(
          'RustFS upload failed. Kiem tra CORS/presigned host cua RustFS.'
        )
      );
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve();
        return;
      }

      reject(new Error(`RustFS upload failed (${request.status})`));
    };

    request.send(file);
  });
}
