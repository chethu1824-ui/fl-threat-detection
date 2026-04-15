// Shared utilities across all pages

// Session storage keys
const KEY_JOB_ID    = 'fl_job_id';
const KEY_FILE_ID   = 'fl_file_id';
const KEY_RESULTS   = 'fl_results';

function getJobId()    { return sessionStorage.getItem(KEY_JOB_ID); }
function setJobId(id)  { sessionStorage.setItem(KEY_JOB_ID, id); }
function getFileId()   { return sessionStorage.getItem(KEY_FILE_ID); }
function setFileId(id) { sessionStorage.setItem(KEY_FILE_ID, id); }
function getResults()  { const r = sessionStorage.getItem(KEY_RESULTS); return r ? JSON.parse(r) : null; }
function setResults(r) { sessionStorage.setItem(KEY_RESULTS, JSON.stringify(r)); }

// Drag-drop on any upload zone
document.querySelectorAll('.upload-zone').forEach(zone => {
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag');
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = zone.querySelector('input[type=file]');
      if (input && input.onchange) {
        const dt = new DataTransfer(); dt.items.add(file);
        input.files = dt.files;
        input.onchange({ target: input });
      }
    }
  });
});
