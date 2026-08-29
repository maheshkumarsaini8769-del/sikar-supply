export function resizeImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        if (w > maxWidth) { h = (h * maxWidth) / w; w = maxWidth; }
        if (h > maxHeight) { w = (w * maxHeight) / h; h = maxHeight; }
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w);
        canvas.height = Math.round(h);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          const resized = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() });
          resolve(resized);
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export function resizeImages(files, maxWidth = 1200, maxHeight = 800, quality = 0.85) {
  return Promise.all(Array.from(files).map(f => resizeImage(f, maxWidth, maxHeight, quality)));
}
