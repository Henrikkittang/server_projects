
async function chartIt(){
    const data = await getData();
    const ctx = document.getElementById('chart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.xs,
            datasets: [{
                label: 'Combined Land-Surface Air and Sea-Surface Water Temperature',
                data: data.ys,
                fill: false,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        
    });
}

async function getData(){
    const xs = [];
    const ys = [];
    
    const response = await fetch("global_temp.csv");
    const data = await response.text();

    const table = data.split("\n").slice(1);
    table.forEach(row => {
        const columns = row.split(",");
        const year = columns[0];
        const temp = columns[1];
        xs.push(year);
        ys.push(parseFloat(temp) + 14);
    });
    return {xs, ys};
}

chartIt();

/**/
