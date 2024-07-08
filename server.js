const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

function runGhostscript(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Ghostscript error: ${error}`);
                reject(error);
                return;
            }
            resolve();
        });
    });
}

app.post('/compress', upload.single('pdf'), async (req, res) => {
    try {
        const inputPath = req.file.path;
        const outputPath = path.join('uploads', 'compressed.pdf');

        console.log('Input path:', inputPath);
        console.log('Output path:', outputPath);

        await runGhostscript(inputPath, outputPath);

        console.log('Compression completed');

        await fs.unlink(inputPath);

        const stats = await fs.stat(outputPath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

        res.json({ size: fileSizeInMegabytes.toFixed(2) });
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ error: error.message || 'An error occurred during compression' });
    }
});

app.get('/download', (req, res) => {
    const file = path.join(__dirname, 'uploads', 'compressed.pdf');
    res.download(file, 'compressed.pdf');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});