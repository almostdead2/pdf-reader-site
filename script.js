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
    pdfjsLib.getDocument({ data: typedarray }).promise.then(function(pdf) {
      pdfDoc = pdf;
      document.getElementById('page-count').textContent = pdf.numPages;
      pageNum = 1;
      renderPage(pageNum);
    });
  };
  reader.readAsArrayBuffer(file);
});

function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

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
