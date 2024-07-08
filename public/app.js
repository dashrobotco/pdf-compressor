document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const loader = document.getElementById('loader');
    const downloadBtn = document.getElementById('downloadBtn');
    const newFileBtn = document.getElementById('newFileBtn');
    const fileSizeInfo = document.getElementById('fileSizeInfo');

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadBtn.style.display = 'none';
            loader.style.display = 'block';

            const formData = new FormData();
            formData.append('pdf', file);

            try {
                const response = await fetch('/compress', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    loader.style.display = 'none';
                    downloadBtn.style.display = 'inline-block';
                    newFileBtn.style.display = 'inline-block';

                    const originalSize = file.size / (1024 * 1024);
                    const compressedSize = parseFloat(result.size);
                    const percentSmaller = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

                    fileSizeInfo.textContent = `Original size: ${originalSize.toFixed(2)} MB
                        Compressed size: ${compressedSize.toFixed(2)} MB
                        ${percentSmaller}% smaller`;
                } else {
                    throw new Error('Compression failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during compression');
                loader.style.display = 'none';
                uploadBtn.style.display = 'inline-block';
            }
        }
    });

    downloadBtn.addEventListener('click', async () => {
        const response = await fetch('/download');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'compressed.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    });

    newFileBtn.addEventListener('click', () => {
        uploadBtn.style.display = 'inline-block';
        downloadBtn.style.display = 'none';
        newFileBtn.style.display = 'none';
        fileInput.value = '';
        fileSizeInfo.textContent = '';
    });
});