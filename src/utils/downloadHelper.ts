/**
 * Reliable cross-browser / cross-sandbox file downloader helper.
 * Handles Blob URLs, Data URLs, and fallback anchor injection.
 */
export async function triggerFileDownload(blobOrUrl: Blob | string, filename: string): Promise<boolean> {
  const cleanFilename = filename.trim().endsWith('.pdf') ? filename.trim() : `${filename.trim()}.pdf`;

  try {
    let blob: Blob;

    if (blobOrUrl instanceof Blob) {
      blob = blobOrUrl;
    } else if (typeof blobOrUrl === 'string' && blobOrUrl.startsWith('data:')) {
      const res = await fetch(blobOrUrl);
      blob = await res.blob();
    } else {
      // Standard blobUrl
      const res = await fetch(blobOrUrl);
      blob = await res.blob();
    }

    // Direct Blob URL download anchor
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = cleanFilename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(objectUrl);
    }, 1500);

    // Fallback Data URL anchor for strict sandboxed webviews
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const dataLink = document.createElement('a');
        dataLink.href = reader.result;
        dataLink.download = cleanFilename;
        dataLink.style.display = 'none';
        document.body.appendChild(dataLink);
        dataLink.click();
        setTimeout(() => {
          if (document.body.contains(dataLink)) {
            document.body.removeChild(dataLink);
          }
        }, 500);
      }
    };
    reader.readAsDataURL(blob);

    return true;
  } catch (err) {
    console.error('File download helper error:', err);

    // Last resort fallback: direct window navigation / open
    if (typeof blobOrUrl === 'string') {
      window.open(blobOrUrl, '_blank');
    }
    return false;
  }
}
