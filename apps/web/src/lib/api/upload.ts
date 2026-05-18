'use client';

export function putFileToSignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    console.log('>>> [PUT] Sending file to:', uploadUrl);
    request.open('PUT', uploadUrl);
    request.setRequestHeader(
      'Content-Type',
      file.type || 'application/octet-stream'
    );

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      const progress = Math.round((event.loaded / event.total) * 100);
      console.log(`>>> [PUT] Progress: ${progress}%`);
      onProgress?.(progress);
    };

    request.onerror = () => {
      console.error('>>> [PUT] Network Error occurred');
      reject(
        new Error(
          'RustFS upload failed. Kiem tra CORS/presigned host cua RustFS.'
        )
      );
    };

    request.onload = () => {
      console.log('>>> [PUT] Load finished. Status:', request.status);
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
