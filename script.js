let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    canvas = document.getElementById('pdf-canvas'),
    ctx = canvas.getContext('2d');

document.getElementById('file-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file || file.type !== 'application/pdf') return alert('Please select a PDF file.');

  const reader = new FileReader();
  reader.onload = function() {
    const typedarray = new Uint8Array(this.result);
    loadPdf(typedarray); // use helper to handle password
  };
  reader.readAsArrayBuffer(file);
});

function loadPdf(data, password = null) {
  pdfjsLib.getDocument({ data, password }).promise.then(function(pdf) {
    pdfDoc = pdf;
    document.getElementById('page-count').textContent = pdf.numPages;
    pageNum = 1;
    renderPage(pageNum);
  }).catch(function(error) {
    if (error.name === 'PasswordException') {
      const userPassword = prompt("This PDF is password protected. Please enter the password:");
      if (userPassword !== null) {
        loadPdf(data, userPassword);
      }
    } else {
      alert('Failed to open PDF: ' + error.message);
    }
  });
}

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(function(page) {
    const scale = 3; // high-quality export
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    canvas.style.width = (viewport.width / scale) + 'px';
    canvas.style.height = (viewport.height / scale) + 'px';

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    page.render(renderContext).promise.then(function() {
      pageRendering = false;
    });

    document.getElementById('page-num').textContent = num;
  });
}

document.getElementById('prev-page').addEventListener('click', function() {
  if (pageNum <= 1) return;
  pageNum--;
  renderPage(pageNum);
});

document.getElementById('next-page').addEventListener('click', function() {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  renderPage(pageNum);
});

// Export to image (PNG/JPEG/JPG)
document.getElementById('export-image').addEventListener('click', function() {
  const format = document.getElementById('image-format').value;
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const dataURL = canvas.toDataURL(mimeType, 1.0);

  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `page-${pageNum}.${format}`;
  link.click();
});
