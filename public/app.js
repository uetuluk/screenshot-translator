document.addEventListener('DOMContentLoaded', function() {
    const storedText = localStorage.getItem('lastTranslatedText');
    const storedImage = localStorage.getItem('lastUploadedImage');
    const storedExtractedText = localStorage.getItem('lastExtractedText');

    if (storedText) {
        document.getElementById('extractedTextPreview').textContent = storedText;
        document.querySelector(".correctTranslationDiv").style.display = "block";
    }

    if (storedExtractedText) {
        document.getElementById('extracted_test').value = storedExtractedText;
        document.querySelector(".correctTranslationDiv").style.display = "block";
    }

    if (storedImage) {
        document.getElementById('imagePreview').src = storedImage;
        document.getElementById('imagePreview').style.display = 'block';
    }
});

function previewImage(file) {
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('imagePreview').src = e.target.result;

             // store image
            const base64Image = document.getElementById('imagePreview').src;
            localStorage.setItem('lastUploadedImage', base64Image);
        }

        reader.readAsDataURL(file);
        reader.onloadend = () => uploadFile(file); // Upload file after previewing
    }
}

document.getElementById('screenshot').addEventListener('change', function() {
    previewImage(this.files[0]);
});

document.addEventListener('dragover', function(e) {
    e.preventDefault();
});

document.addEventListener('drop', function(e) {
    e.preventDefault();
});

const dropZone = document.body;

dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.backgroundColor = '#eaeaea';  // change background color to give visual feedback
});

dropZone.addEventListener('dragleave', function(e) {
    this.style.backgroundColor = '';  // reset background color
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.backgroundColor = '';  // reset background color

    const file = e.dataTransfer.files[0];
    document.getElementById('screenshot').files = e.dataTransfer.files;  // set the dropped file to the file input
    previewImage(file);
});

function translateText(textToTranslate) {
    fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textToTranslate })
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById('extractedTextPreview').textContent = data;
        document.querySelector("#translationSpinner").style.display = "none";
        document.querySelector(".correctTranslationDiv").style.display = "block";
        localStorage.setItem('lastTranslatedText', data);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('extractedTextPreview').textContent = 'Error translating the text.';
        document.querySelector("#translationSpinner").style.display = "none";
    });
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('screenshot', file);
    document.querySelector("#uploadSpinner").style.display = "block";

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(text => {
        document.querySelector("#uploadSpinner").style.display = "none";
        document.getElementById('extracted_test').value = text;
        document.getElementById('extractedTextPreview').textContent = text;
        // Automatically trigger the translation after OCR
        document.querySelector("#translationSpinner").style.display = "block";
        translateText(text);

        // store raw text
        localStorage.setItem('lastExtractedText', text);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('extractedTextPreview').textContent = 'Error uploading or processing the image.';
        document.querySelector("#uploadSpinner").style.display = "none";
    });
}

document.getElementById('translateForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent the default form submit behavior
    const textToTranslate = document.getElementById('extracted_test').value;
    document.querySelector("#translationSpinner").style.display = "block";
    translateText(textToTranslate);  // Re-translate the corrected text
});

function toggleEditSection() {
    const form = document.getElementById('translateForm');
    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}