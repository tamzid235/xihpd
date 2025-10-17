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
    <h2>Add Project</h2>
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
    projects[id] = projects[id] || { address, scope, inspections: [] };
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
    if (!projects[id]) return alert("Project not found!");

    content.innerHTML = `
      <h2>Inspection for ${id}</h2>
      <input type="date" id="date">
      <input type="time" id="time">
      <textarea id="obs" placeholder="Observations"></textarea>
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
        projects[id].inspections.push({
          date,
          time: formattedTime,
          obs,
          photo: reader.result
        });
        saveProjects(projects);
        alert("Inspection saved!");
      };
      if (photo) reader.readAsDataURL(photo);
      else reader.onload(); // Save without image
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

    project.inspections.forEach((i, index) => {
      html += `
        <div style="margin:15px;padding:10px;border:1px solid #ccc;border-radius:10px;">
          <b>Inspection ${index + 1}</b><br>
          Date: ${i.date} | Time: ${i.time}<br>
          <p>${i.obs}</p>
          ${i.photo ? `<img src="${i.photo}" style="width:100%;border-radius:10px;">` : ""}
        </div>
      `;
    });
    content.innerHTML = html;
  };
};
