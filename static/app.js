// --- UX/HELPER FUNCTIONS ---

function showToast(message, type = '') {
    const toast = document.getElementById('message');
    toast.className = '';
    toast.textContent = message;

    if (type) toast.classList.add(type);

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

function renderMetadata(infoId, data) {
    const infoElement = document.getElementById(infoId);
    infoElement.innerHTML = '';

    for (const [key, value] of Object.entries(data)) {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${key}:</strong> <span>${value}</span>`;
        p.style.animationDelay = `${Object.keys(data).indexOf(key) * 0.1}s`;
        infoElement.appendChild(p);
    }
}

function setProcessingState(isProcessing, message = "") {
    const controls = document.getElementById('uploadControls');
    const statusBar = document.getElementById('statusBar');
    
    if (isProcessing) {
        controls.classList.add('disabled-controls');
        statusBar.textContent = message;
        statusBar.classList.add('visible');
    } else {
        controls.classList.remove('disabled-controls');
        statusBar.classList.remove('visible');
    }
}

window.onload = function() {
    const preloader = document.getElementById('preloader');
    setTimeout(() => preloader?.classList.add('hidden'), 1000);
}

// --- FILE INPUT CHANGE LISTENER ---
const fileInput = document.getElementById('fileInput');
const fileInputLabel = document.getElementById('fileInputLabel');
const customFileInput = document.querySelector('.custom-file-input');

fileInput.addEventListener('change', (event) => {
    if (event.target.files.length > 0) {
        fileInputLabel.textContent = event.target.files[0].name;
        customFileInput.classList.add('file-selected');
    } else {
        fileInputLabel.textContent = 'Choose File';
        customFileInput.classList.remove('file-selected');
    }
});

// --- CORE LOGIC ---
const downloadBtn = document.getElementById('downloadBtn');
const resizedImg = document.getElementById('resizedImage');
const resizedInfoBox = document.getElementById('resizedInfo');

document.getElementById('uploadBtn').addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        showToast("Please select an image file first!", 'error');
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setProcessingState(true, "Uploading and Initializing Resize...");
    downloadBtn.style.display = "none";

    document.getElementById('originalImage').src = '';
    resizedImg.src = '';
    document.getElementById('originalInfo').innerHTML = '';
    resizedInfoBox.innerHTML = '';

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (response.status !== 200) {
            showToast(`Upload failed: ${data.message || 'Server error'}`, 'error');
            setProcessingState(false);
            return;
        }

        // ORIGINAL IMAGE PREVIEW
        const originalImg = document.getElementById('originalImage');
        originalImg.src = URL.createObjectURL(file);
        originalImg.style.opacity = 0;

        await new Promise(resolve => {
            originalImg.onload = resolve;
            originalImg.onerror = () => {
                showToast("Error loading original image preview.", 'error');
                resolve();
            };
        });

        originalImg.style.transition = "opacity 1s";
        originalImg.style.opacity = 1;

        renderMetadata('originalInfo', {
            'File Name': file.name,
            'File Size': `${(file.size / 1024).toFixed(1)} KB`,
            'Dimensions': `${originalImg.naturalWidth} x ${originalImg.naturalHeight} px`,
            'Type': file.type.split('/').pop().toUpperCase()
        });

        setProcessingState(true, "Generating Optimized Image...");

        // WAIT FOR RESIZED FILE
        resizedInfoBox.innerHTML = `<p style="color:#00bcd4;font-weight:500;">Processing...</p>`;

        setTimeout(async () => {
            const resizedUrl = `https://sftirp-resized-990060747519.s3.amazonaws.com/resized-${data.file_key}`;

            let resizedResponse, blob;

            try {
                resizedResponse = await fetch(resizedUrl);
                if (!resizedResponse.ok) throw new Error("Could not fetch resized image.");
                blob = await resizedResponse.blob();
            } catch (e) {
                showToast(`Failed to retrieve resized image: ${e.message}`, 'error');
                setProcessingState(false);
                return;
            }

            const sizeKB = (blob.size / 1024).toFixed(1);
            const fileType = blob.type.split('/').pop().toUpperCase();

            // SET RESIZED IMG
            resizedImg.src = resizedUrl;
            resizedImg.style.opacity = 0;

            resizedImg.onload = () => {
                resizedImg.style.transition = "opacity 1s";
                resizedImg.style.opacity = 1;

                renderMetadata('resizedInfo', {
                    'File Key': data.file_key,
                    'File Size': `${sizeKB} KB`,
                    'Dimensions': `${resizedImg.naturalWidth} x ${resizedImg.naturalHeight} px`,
                    'Type': fileType
                });

                downloadBtn.style.display = "inline-block";
                downloadBtn.onclick = () => {
                    const link = document.createElement('a');
                    link.href = resizedUrl;
                    link.download = `resized-${file.name.split('.')[0]}.${fileType.toLowerCase()}`;
                    link.click();
                    showToast("Download started!", 'success');
                };

                showToast("Image resized successfully!", 'success');
                setProcessingState(false);
            };

        }, 5000);

    } catch (err) {
        console.error(err);
        showToast(`An unexpected error occurred: ${err.message}`, 'error');
        setProcessingState(false);
    }
});
