function analyzeData(event) {
    event.preventDefault(); // Prevent form submission

    const form = document.getElementById("blood-chemistry-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Form data validation
    for (const [key, value] of Object.entries(data)) {
        if (key.includes('glucosa') || key.includes('colesterol') || key.includes('trigliceridos') || key.includes('psa')) {
            if (!value) {
                const label = document.querySelector(`label[for="${key}"]`).innerText;
                alert(`Por favor ingresa un valor para ${label}`);
                return;
            }
        }
    }

    // Create results page
    displayResults(data);
}

function displayResults(data) {
    // Hide the form
    const form = document.getElementById("blood-chemistry-form");
    form.style.display = "none";

    // Create results container
    const resultsContainer = document.createElement("div");
    resultsContainer.className = "container border p-4 rounded shadow mt-4 mb-4";
    resultsContainer.id = "results-container";

    // Add header
    const header = document.createElement("div");
    header.innerHTML = `
<h2 class="text-center mb-4">Resultados del Análisis</h2>
<div class="row mb-4">
    <div class="col-md-6">
        <p><strong>Paciente:</strong> ${data.usuario || 'No especificado'}</p>
        <p><strong>Documento ID:</strong> ${data.documentId || 'No especificado'}</p>
        <p><strong>Edad:</strong> ${data.edad || 'No especificada'}</p>
    </div>
    <div class="col-md-6">
        <p><strong>Médico:</strong> ${data.medico || 'No especificado'}</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
</div>
    `;
    resultsContainer.appendChild(header);

    // Create results table
    const resultsTable = document.createElement("table");
    resultsTable.className = "table table-striped";
    resultsTable.innerHTML = `<thead> <tr>
    <th>Parámetro</th>
    <th>Valor</th>
    <th>Valores de Referencia</th>
    <th>Interpretación</th>
    </tr>
    </thead>
    <tbody>
        ${createResultRow("Glucosa en Ayunas", data.glucosa, "< 110 mg/dL", interpretGlucose(data.glucosa))}
        ${createResultRow("Colesterol Total", data["colesterol-total"], "< 200 mg/dL", interpretCholesterol(data["colesterol-total"]))}
        ${createResultRow("Colesterol HDL", data["colesterol-hdl"], "40-60 mg/dL", interpretHDL(data["colesterol-hdl"]))}
        ${createResultRow("Colesterol LDL", data["colesterol-ldl"], "< 100 mg/dL", interpretLDL(data["colesterol-ldl"]))}
        ${createResultRow("Colesterol VLDL", data["colesterol-vldl"], "2-30 mg/dL", interpretVLDL(data["colesterol-vldl"]))}
        ${createResultRow("Triglicéridos", data.trigliceridos, "0-150 mg/dL", interpretTriglycerides(data.trigliceridos))}
        ${data.psa ? createResultRow("Antígeno Prostático Específico", data.psa, "0-6.5 ng/ml", interpretPSA(data.psa)) : ''}
        </tbody>`;
    resultsContainer.appendChild(resultsTable);

    // Add recommendation section
    const recommendations = document.createElement("div");
    recommendations.className = "mt-4 p-3 border rounded";
    recommendations.innerHTML = `<h3>Recomendaciones</h3>
        <p>${generateRecommendations(data)}</p>
        <button class="btn btn-primary w-25 mt-4" id="back-btn">Volver al formulario</button>`;

    resultsContainer.appendChild(recommendations);

    // Results container before the footer
    const footer = document.querySelector('.footer');
    document.body.insertBefore(resultsContainer, footer);

    // Event listener to back button
    const back_btn = document.getElementById("back-btn");

    back_btn.addEventListener("click", () => {
        document.getElementById("results-container").remove();
        form.style.display = "block";
    });

    back_btn.style.padding = "12px";
    back_btn.style.fontSize = "1.2rem";
    back_btn.style.fontWeight = "600";
    back_btn.style.borderRadius = "10px";
}

function createResultRow(parameter, value, reference, interpretation) {
    let statusClass = "";
    if (interpretation.includes("Elevado") || interpretation.includes("Bajo")) {
        statusClass = "table-danger";
    } else if (interpretation.includes("Normal")) {
        statusClass = "table-success";
    }

    return `<tr class="${statusClass}">
    <td>${parameter}</td>
    <td>${value}</td>
    <td>${reference}</td>
    <td>${interpretation}</td>
    </tr>`;
}

function interpretGlucose(value) {
    value = parseFloat(value);
    if (value < 70) return "Bajo - Hipoglucemia";
    if (value < 110) return "Normal";
    if (value < 126) return "Elevado - Prediabetes";
    return "Elevado - Diabetes";
}

function interpretCholesterol(value) {
    value = parseFloat(value);
    if (value < 200) return "Normal";
    if (value < 240) return "Elevado - Riesgo moderado";
    return "Elevado - Riesgo alto";
}

function interpretHDL(value) {
    value = parseFloat(value);
    if (value < 40) return "Bajo - Riesgo cardiovascular elevado";
    if (value < 60) return "Normal";
    return "Elevado - Protector";
}

function interpretLDL(value) {
    value = parseFloat(value);
    if (value < 100) return "Óptimo";
    if (value < 130) return "Normal";
    if (value < 160) return "Elevado - Riesgo moderado";
    return "Elevado - Riesgo alto";
}

function interpretVLDL(value) {
    value = parseFloat(value);
    if (value < 2) return "Bajo";
    if (value <= 30) return "Normal";
    return "Elevado";
}

function interpretTriglycerides(value) {
    value = parseFloat(value);
    if (value < 150) return "Normal";
    if (value < 200) return "Elevado - Riesgo leve";
    if (value < 500) return "Elevado - Riesgo moderado";
    return "Elevado - Riesgo alto";
}

function interpretPSA(value) {
    value = parseFloat(value);
    if (value <= 4) return "Normal";
    if (value <= 10) return "Elevado - Riesgo moderado";
    return "Elevado - Riesgo alto";
}

function generateRecommendations(data) {
    let recommendations = [];

    // Glucose recommendations
    const glucose = parseFloat(data.glucosa);
    if (glucose >= 126) {
        recommendations.push("Controlar niveles de glucosa, considerar medicación para diabetes.");
    } else if (glucose >= 110) {
        recommendations.push("Vigilar niveles de glucosa, ajustar dieta reduciendo carbohidratos simples.");
    }

    // Cholesterol recommendations
    const cholesterol = parseFloat(data["colesterol-total"]);
    const ldl = parseFloat(data["colesterol-ldl"]);
    const hdl = parseFloat(data["colesterol-hdl"]);

    if (cholesterol >= 240 || ldl >= 160) {
        recommendations.push("Reducir ingesta de grasas saturadas, aumentar actividad física.");
    } else if (cholesterol >= 200 || ldl >= 130) {
        recommendations.push("Moderar consumo de grasas, aumentar fibra en la dieta.");
    }

    if (hdl < 40) {
        recommendations.push("Aumentar actividad física, considerar consumo moderado de ácidos grasos omega-3.");
    }

    // Triglycerides recommendations
    const triglycerides = parseFloat(data.trigliceridos);
    if (triglycerides >= 200) {
        recommendations.push("Reducir consumo de azúcares y alcohol, aumentar actividad física.");
    }

    // PSA recommendations
    if (data.psa) {
        const psa = parseFloat(data.psa);
        if (psa > 4) {
            recommendations.push("Consultar con urólogo para evaluación adicional.");
        }
    }

    // Default recommendation
    if (recommendations.length === 0) {
        return "Sus niveles sanguíneos se encuentran dentro de los rangos normales. Mantenga hábitos saludables y realice chequeos periódicos.";
    }

    return recommendations.join("<br>");
}

document.getElementById("analyze-btn").addEventListener("click", analyzeData);