// script.js

document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('download-btn');
  const urlInput = document.getElementById('url-input');
  const statusMessage = document.getElementById('status-message');
  const formatRadios = document.querySelectorAll('input[name="format"]');
  const qualitySelect = document.getElementById('quality-select');
  const downloadsList = document.getElementById('downloads-list');
  const clearDownloadsBtn = document.getElementById('clear-downloads-btn');

  // Toggle quality select based on format
  formatRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'audio') {
        qualitySelect.style.display = 'none';
      } else {
        qualitySelect.style.display = 'block';
      }
    });
  });

  // Load existing downloads on page load
  loadDownloads();

  downloadBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();
    const format = document.querySelector('input[name="format"]:checked').value;
    const quality = qualitySelect.value;

    if (!url) {
      statusMessage.textContent = 'Please enter a valid URL.';
      statusMessage.style.color = 'red';
      return;
    }

    statusMessage.textContent = `⬇️ Downloading ${format}...`;
    statusMessage.style.color = 'blue';

    try {
      const response = await fetch('http://localhost:3000/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format, quality }),
      });

      const data = await response.json();

      if (response.ok) {
        statusMessage.textContent = '✅ Download complete!';
        statusMessage.style.color = 'green';
        loadDownloads(); // Refresh downloads list
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("❌ Error downloading:", error);
      statusMessage.textContent = '❌ Error downloading. Please check the URL and try again.';
      statusMessage.style.color = 'red';
    }
  });

  clearDownloadsBtn.addEventListener('click', () => {
    downloadsList.innerHTML = '';
  });

  async function loadDownloads() {
    try {
      const response = await fetch('http://localhost:3000/downloads');
      const files = await response.json();

      downloadsList.innerHTML = '';

      files.forEach(file => {
        const downloadItem = document.createElement('div');
        downloadItem.className = 'download-item';

        const fileName = document.createElement('span');
        fileName.className = 'file-name';
        fileName.textContent = file;

        const downloadLink = document.createElement('a');
        downloadLink.href = `http://localhost:3000/downloads/${file}`;
        downloadLink.download = file;
        downloadLink.className = 'download-link';
        downloadLink.textContent = 'Download';

        downloadItem.appendChild(fileName);
        downloadItem.appendChild(downloadLink);
        downloadsList.appendChild(downloadItem);
      });
    } catch (error) {
      console.error('Error loading downloads:', error);
    }
  }
});
