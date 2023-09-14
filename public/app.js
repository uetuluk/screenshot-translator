function previewImage(file) {
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
        }

        reader.readAsDataURL(file);
        reader.onloadend = () => uploadFile(file); // Upload file after previewing
    }
}

document.getElementById('screenshot').addEventListener('change', function() {
    previewImage(this.files[0]);
});

const dropZone = document.getElementById('dropZone');
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


function uploadFile(file) {
    const formData = new FormData();
    formData.append('screenshot', file);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(text => {
        document.getElementById('extracted_text').value = text;
        document.getElementById('extractedTextPreview').textContent = text;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('extractedTextPreview').textContent = 'Error uploading or processing the image.';
    });
}

document.getElementById('translateForm').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent the default form submit behavior
    
    const textToTranslate = document.getElementById('extracted_text').value;

    fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textToTranslate })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        if (data) {
            document.getElementById('extractedTextPreview').textContent = data;
        } else {
            throw new Error("Translation not received");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('extractedTextPreview').textContent = 'Error translating the text.';
    });
});