document.addEventListener('DOMContentLoaded', () => {
  const projects = JSON.parse(localStorage.getItem('projects') || '{}');

  const saveProjects = () => localStorage.setItem('projects', JSON.stringify(projects));

  // ---------- DATA ----------
  document.getElementById('dataBtn').addEventListener('click', () => {
    const id = prompt("Enter Project ID:");
    if (!id) return;
    if (projects[id]) return alert("Project ID already exists!");

    const address = prompt("Enter Project Address:");
    const scope = prompt("Enter Project Scope:");

    projects[id] = { address, scope, inspections: [] };
    saveProjects();
    alert("Project saved successfully!");
  });

  // ---------- INSPECTION ----------
  document.getElementById('inspectionBtn').addEventListener('click', () => {
    const id = prompt("Enter Project ID:");
    if (!id || !projects[id]) return alert("Project not found.");

    const date = prompt("Enter date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2,'0');
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
          const m = String(photoTimestamp.getMinutes()).padStart(2,'0');
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

  // ---------- REPORT ----------
  document.getElementById('reportBtn').addEventListener('click', () => {
    const id = prompt("Enter Project ID:");
    if (!id || !projects[id]) return alert("Project not found.");

    const project = projects[id];
    const date = prompt("Enter date to view inspection (YYYY-MM-DD):");
    const inspection = project.inspections.find(i => i.date === date);

    if (!inspection) return alert("No inspection found for that date.");

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
        </style>
      </head>
      <body>
        <h2>Project ID: ${id}</h2>
        <p><strong>Address:</strong> ${project.address}</p>
        <p><strong>Scope:</strong> ${project.scope}</p>
        <hr>
        <h3>Inspection on ${inspection.date} at ${inspection.time}</h3>
        <p>${inspection.observations}</p>
        ${inspection.photos.map(photo => `
          <div>
            <img src="${photo.data}" alt="Photo">
            <div class="caption">[${photo.timestamp}] (${id})</div>
          </div>
        `).join('')}
      </body>
      </html>
    `);
  });
});
