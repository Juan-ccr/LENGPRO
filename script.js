
document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        let data;

        try {
            if (file.name.endsWith(".json")) {
                data = JSON.parse(content);
            } else if (file.name.endsWith(".csv")) {
                const rows = content.split("\n").filter(Boolean);
                const headers = rows[0].split(",");
                data = rows.slice(1).map(row => {
                    const values = row.split(",");
                    return headers.reduce((obj, header, index) => {
                        obj[header] = values[index];
                        return obj;
                    }, {});
                });
            } else {
                alert("Formato no soportado.");
                return;
            }

            localStorage.setItem("loadedData", JSON.stringify(data));
            displayData(data);
            drawChart(data);
        } catch (error) {
            alert("Error al procesar el archivo.");
        }
    };
    reader.readAsText(file);
});

function displayData(data) {
    const table = document.getElementById("dataTable");
    table.innerHTML = "";
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const headerRow = document.createElement("tr");
    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    data.forEach(row => {
        const tr = document.createElement("tr");
        headers.forEach(header => {
            const td = document.createElement("td");
            td.textContent = row[header];
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}

function drawChart(data) {
    const labels = data.map(row => row[Object.keys(row)[0]]);
    const values = data.map(row => parseFloat(row[Object.keys(row)[1]]));

    const ctx = document.getElementById("dataChart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Valores",
                data: values,
                backgroundColor: "rgba(75, 192, 192, 0.6)"
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Cargar desde localStorage al inicio
const savedData = localStorage.getItem("loadedData");
if (savedData) {
    const parsedData = JSON.parse(savedData);
    displayData(parsedData);
    drawChart(parsedData);
}
