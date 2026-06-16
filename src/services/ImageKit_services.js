const ImageKit = require("imagekit");
function createImageKitClient() {
    const publicKey = process.env.IMAGEKIT_Public_key;
    const privateKey = process.env.IMAGEKIT_Private_key;
    const urlEndpoint = process.env.IMAGEKIT_URL_endpoint;

    if (!publicKey || !privateKey || !urlEndpoint) {
        throw new Error("ImageKit environment variables are missing");
    }

    return new ImageKit({
        publicKey,
        privateKey,
        urlEndpoint
    });
}

async function uploadFile(file, fileName, mimeType = 'application/octet-stream') {
    const imagekit = createImageKitClient();
    
    if (!file) {
        throw new Error('uploadFile received an undefined file value');
    }

    if (Buffer.isBuffer(file) && file.length === 0) {
        throw new Error(`uploadFile received an empty buffer for ${fileName}`);
    }

    try {
        console.log('ImageKit upload starting:', {
            fileName,
            mimeType,
            fileSize: Buffer.isBuffer(file) ? file.length : 'unknown',
        });

        // New @imagekit/nodejs expects Buffer directly, not base64 data URL
        const result = await imagekit.upload({
            file: file,  // Pass Buffer directly
            fileName: fileName,
            mimeType: mimeType
        });

        console.log('ImageKit upload successful:', {
            fileName,
            url: result.url,
            fileId: result.fileId
        });

        return result;
    } catch (error) {
        console.error('ImageKit upload failed:', {
            fileName,
            error: error.message,
            errorCode: error.code
        });
        throw new Error(`ImageKit upload failed: ${error.message}`);
    }
}

module.exports={uploadFile}

