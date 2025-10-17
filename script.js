const content = document.getElementById("content");

// Helper: Load all projects
function loadProjects() {
  return JSON.parse(localStorage.getItem("projects")) || {};
}

// Helper: Save all projects
function saveProjects(projects) {
  localStorage.setItem("projects", JSON.stringify(projects));
}

// Helper: Convert 24-hour time to 12-hour format
function formatTimeTo12Hour(time24) {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  let h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}

// DATA SECTION
document.getElementById("dataBtn").onclick = () => {
  content.innerHTML = `
    <h2>Add or Edit Project</h2>
    <input id="projId" placeholder="Project ID">
    <input id="address" placeholder="Address">
    <input id="scope" placeholder="Scope">
    <button id="saveData">Save Project</button>
  `;

  document.getElementById("saveData").onclick = () => {
    const id = document.getElementById("projId").value.trim();
    const address = document.getElementById("address").value.trim();
    const scope = document.getElementById("scope").value.trim();

    if (!id) return alert("Please enter a project ID");

    let projects = loadProjects();

    // Check for duplicate IDs
    if (projects[id] && !confirm("Project ID already exists. Overwrite?")) return;

    projects[id] = projects[id] || {};
    projects[id].address = address;
    projects[id].scope = scope;
    saveProjects(projects);
    alert("Project saved!");
  };
};

// INSPECTION SECTION
document.getElementById("inspectionBtn").onclick = () => {
  content.innerHTML = `
    <h2>Inspection</h2>
    <input id="projId" placeholder="Project ID">
    <button id="loadInspection">Load Project</button>
  `;

  document.getElementById("loadInspection").onclick = () => {
    const id = document.getElementById("projId").value.trim();
    const projects = loadProjects();
    const project = projects[id];

    if (!project) return alert("Project not found!");

    // Pre-fill existing inspection if it exists
    const prev = project.inspection || {};
    const prevDate = prev.date || "";
    const prevTime = prev.time ? prev.time.replace(/(AM|PM)/i, "").trim() : "";
    const prevObs = prev.obs || "";

    content.innerHTML = `
      <h2>Inspection for ${id}</h2>
      <input type="date" id="date" value="${prevDate}">
      <input type="time" id="time" value="${prevTime}">
      <textarea id="obs" placeholder="Observations">${prevObs}</textarea>
      <input type="file" id="photo" accept="image/*">
      <button id="saveInspection">Save Inspection</button>
    `;

    document.getElementById("saveInspection").onclick = () => {
      const date = document.getElementById("date").value;
      const time = document.getElementById("time").value;
      const obs = document.getElementById("obs").value;
      const photo = document.getElementById("photo").files[0];

      if (!date || !time || !obs) return alert("Please fill out all fields");

      const formattedTime = formatTimeTo12Hour(time);

      const reader = new FileReader();
      reader.onload = function() {
        const projects = loadProjects();
        projects[id].inspection = {
          date,
          time: formattedTime,
          obs,
          photo: reader.result
        };
        saveProjects(projects);
        alert("Inspection saved (1 per project).");
      };
      if (photo) reader.readAsDataURL(photo);
      else {
        const projects = loadProjects();
        projects[id].inspection = {
          date,
          time: formattedTime,
          obs,
          photo: prev.photo || null
        };
        saveProjects(projects);
        alert("Inspection saved (1 per project).");
      }
    };
  };
};

// REPORT SECTION
document.getElementById("reportBtn").onclick = () => {
  content.innerHTML = `
    <h2>View Report</h2>
    <input id="projId" placeholder="Project ID">
    <button id="loadReport">Load Report</button>
  `;

  document.getElementById("loadReport").onclick = () => {
    const id = document.getElementById("projId").value.trim();
    const projects = loadProjects();
    const project = projects[id];
    if (!project) return alert("Project not found!");

    let html = `<h2>Report for ${id}</h2>`;
    html += `<p><b>Address:</b> ${project.address}<br><b>Scope:</b> ${project.scope}</p>`;

    if (project.inspection) {
      const i = project.inspection;
      html += `
        <div style="margin:15px;padding:10px;border:1px solid #ccc;border-radius:10px;">
          <b>Inspection</b><br>
          Date: ${i.date} | Time: ${i.time}<br>
          <p>${i.obs}</p>
          ${i.photo ? `<img src="${i.photo}" style="width:100%;border-radius:10px;">` : ""}
        </div>
      `;
    } else {
      html += `<p>No inspection data available for this project.</p>`;
    }

    content.innerHTML = html;
  };
};

