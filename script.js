document.addEventListener('DOMContentLoaded', () => {
  const projects = JSON.parse(localStorage.getItem('projects') || '{}');

  const saveProjects = () => localStorage.setItem('projects', JSON.stringify(projects));

  // ---------- DATA SECTION ----------
  document.getElementById('dataBtn').addEventListener('click', () => {
    const id = prompt("Enter Project ID:");
    if (!id) return;

    if (projects[id]) {
      alert("Project ID already exists!");
      return;
    }

    const address = prompt("Enter Project Address:");
    const scope = prompt("Enter Project Scope:");

    projects[id] = { address, scope, inspections: [] };
    saveProjects();
    alert("Project saved successfully!");
  });

  // ---------- INSPECTION SECTION ----------
  document.getElementById('inspectionBtn').addEventListener('click', () => {
    const id = prompt("Enter Project ID:");
    if (!id || !projects[id]) {
      alert("Project not found. Please create it first in 'Data'.");
      return;
    }

    const date = prompt("Enter date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const time = `${hours}:${minutes} ${ampm}`;

    const observations = prompt("Enter observations:");
    if (!observations) return;

    const photos = [];
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.onchange = () => {
      const files = Array.from(input.files);
      let filesLoaded = 0;

      if (files.length === 0) {
        saveInspection();
        return;
      }

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          const photoTimestamp = new Date();
          let h = photoTimestamp.getHours();
          const m = String(photoTimestamp.getMinutes()).padStart(2, '0');
          const ampm2 = h >= 12 ? 'PM' : 'AM';
          h = h % 12 || 12;
          const formattedTime = `${photoTimestamp.getFullYear()}-${String(photoTimestamp.getMonth()+1).padStart(2,'0')}-${String(photoTimestamp.getDate()).padStart(2,'0')} ${h}:${m} ${ampm2}`;

          photos.push({ data: e.target.result, timestamp: formattedTime });
          filesLoaded++;
          if (filesLoaded === files.length) saveInspection();
        };
        reader.readAsDataURL(file);
      });
    };

    input.click();

    function saveInspection() {
      projects[id].inspections.push({ date, time, observations, photos });
      saveProjects();
      alert("Inspection saved successfully!");
    }
  });

  // ---------- REPORT SECTION ----------
  document.getElementById('reportBtn').addEventListener('click', () => {
    const id = prompt("Enter Project ID:");
    if (!id || !projects[id]) {
      alert("Project not found.");
      return;
    }

    const project = projects[id];
    const date = prompt("Enter date to view inspection (YYYY-MM-DD):");
    const inspection = project.inspections.find(i => i.date === date);

    if (!inspection) {
      alert("No inspection found for that date.");
      return;
    }

    const reportWindow = window.open("", "_blank");
    reportWindow.document.write(`
      <html>
      <head>
        <title>Inspection Report - ${id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; background: #fafafa; }
          img { width: 200px; border-radius: 12px; margin: 5px; display: block; }
          .caption { font-size: 13px; color: #555; margin-top: 4px; margin-bottom: 15px; text-align: center; }
          h2 { margin-top: 0; }
          hr { margin: 20px 0; }
          button { background:#ff3b30; color:white; border:none; border-radius:8px; padding:8px 12px; margin-top:10px; cursor:pointer;}
        </style>
      </head>
      <body>
        <h2>Project ID: ${id}</h2>
        <p><strong>Address:</strong> ${project.address}</p>
        <p><strong>Scope:</strong> ${project.scope}</p>
        <hr>
        <h3>Inspection on ${inspection.date} at ${inspection.time}</h3>
        <p>${inspection.observations}</p>
        ${inspection.photos.map((photo, idx) => `
          <div>
            <img src="${photo.data}" alt="Photo">
            <div class="caption">[${photo.timestamp}] (${id})</div>
            <button onclick="deletePhoto(${idx})">Delete Photo</button>
          </div>
        `).join('')}
        <hr>
        <button onclick="deleteInspection()">Delete Entire Inspection</button>
        <button onclick="deleteProject()">Delete Project</button>

        <script>
          const id = "${id}";
          const date = "${inspection.date}";
          function deletePhoto(index){
            const data = JSON.parse(localStorage.getItem('projects') || '{}');
            const photos = data[id].inspections.find(i=>i.date===date).photos;
            if(confirm('Delete this photo?')){
              photos.splice(index,1);
              localStorage.setItem('projects', JSON.stringify(data));
              alert('Photo deleted.');
              location.reload();
            }
          }
          function deleteInspection(){
            const data = JSON.parse(localStorage.getItem('projects') || '{}');
            const ins = data[id].inspections;
            const index = ins.findIndex(i=>i.date===date);
            if(index>=0 && confirm('Delete this inspection?')){
              ins.splice(index,1);
              localStorage.setItem('projects', JSON.stringify(data));
              alert('Inspection deleted.');
              window.close();
            }
          }
          function deleteProject(){
            const data = JSON.parse(localStorage.getItem('projects') || '{}');
            if(confirm('Delete the entire project and all its inspections?')){
              delete data[id];
              localStorage.setItem('projects', JSON.stringify(data));
              alert('Project deleted.');
              window.close();
            }
          }
        </script>
      </body>
      </html>
    `);
  });

  // ---------- DELETE SECTION (shortcut) ----------
  document.getElementById('deleteBtn').addEventListener('click', () => {
    const id = prompt("Enter Project ID to delete:");
    if (!id || !projects[id]) {
      alert("Project not found.");
      return;
    }
    if (confirm(`Are you sure you want to permanently delete project ${id}?`)) {
      delete projects[id];
      saveProjects();
      alert("Project deleted.");
    }
  });
});
