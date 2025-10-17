document.addEventListener('DOMContentLoaded', () => {
  const projects = JSON.parse(localStorage.getItem('projects') || '{}');

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
    localStorage.setItem('projects', JSON.stringify(projects));
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
    const time24 = new Date();
    let hours = time24.getHours();
    const minutes = String(time24.getMinutes()).padStart(2, '0');
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
          photos.push(e.target.result);
          filesLoaded++;
          if (filesLoaded === files.length) saveInspection();
        };
        reader.readAsDataURL(file);
      });
    };

    input.click();

    function saveInspection() {
      projects[id].inspections.push({ date, time, observations, photos });
      localStorage.setItem('projects', JSON.stringify(projects));
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
          img { width: 200px; border-radius: 12px; margin: 5px; }
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
        ${inspection.photos.map(photo => `<img src="${photo}" alt="Photo">`).join('')}
      </body>
      </html>
    `);
  });
});
