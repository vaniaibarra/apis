const url = 'https://mindicador.cl/api/';
let valorDolar, valorEuro, valorBitcoin;
const select = document.querySelector('#selectCoin');
const convertBtn = document.getElementById('convert');
const resultado = document.getElementById('resultadoConversion');
const cantidadInput = document.getElementById('inputPesos');
const graficaSection = document.querySelector('.grafica');


async function obtenerValores() {
    try {
        const res = await fetch(url);
        const datos = await res.json();
        valorDolar = datos.dolar.valor;
        valorEuro = datos.euro.valor;
        valorBitcoin = datos.bitcoin.valor;
        console.log('Valores obtenidos:', valorDolar, valorEuro, valorBitcoin);
    } catch (error) {
        
        console.error('Error al obtener los valores:', error);
    }
}


function configurarGrafica(datosHistorial, nombreMoneda) {
    const fechas = datosHistorial.serie.map(d => d.fecha.split('T')[0]).reverse();
    const valores = datosHistorial.serie.map(d => d.valor).reverse();

    return {
        type: 'line',
        data: {
            labels: fechas,
            datasets: [{
                label: `Comportamiento de ${nombreMoneda}`,
                backgroundColor: 'green',
                borderColor: 'green',
                data: valores,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor en CLP'
                    }
                }
            }
        }
    }; 
}


async function renderGrafica(moneda) {
    const datosHistorial = await datosMoneda(moneda);
    if (!datosHistorial || !datosHistorial.serie) {
        console.error("Actualmente los datos no se encuentran disponibles");
        return;
    }
    const config = configurarGrafica(datosHistorial, moneda);
    const chartDOM = document.getElementById('myChart');
    
    if (window.myChart instanceof Chart) window.myChart.destroy(); // Verifica si existe una instancia de Chart
    window.myChart = new Chart(chartDOM, config);
    graficaSection.style.display = 'block';
}


async function datosMoneda(moneda) {
    try {
        const res = await fetch(`${url}${moneda}`); 
        const datos = await res.json();
        return datos;
    } catch (error) {
        console.error(`No se pudo obtener datos de ${moneda}:`, error);
    }
}


function conversionDolar(cantidad) {
    const calculoFinal = cantidad / valorDolar;
    mostrarResultado(calculoFinal, '$');
}

function conversionEuro(cantidad) {
    const calculoFinal = cantidad / valorEuro;
    mostrarResultado(calculoFinal, '€');
}

function conversionBitcoin(cantidad) {
    const calculoFinal = cantidad / valorBitcoin;
    mostrarResultado(calculoFinal, '$');
}

function mostrarResultado(calculoFinal, simbolo) {
    resultado.innerHTML = '';
    if (isNaN(calculoFinal) || calculoFinal === 0) {
        alert('Por favor ingrese una cantidad válida para hacer la conversión');
        return;
    }
    const pResultado = document.createElement('p');
    pResultado.textContent = `Resultado: ${calculoFinal.toFixed(2)} ${simbolo}`;
    resultado.appendChild(pResultado);
}

    convertBtn.addEventListener('click', async function() {
    const eleccionMoneda = select.value;
    const cantidad = parseFloat(cantidadInput.value);

    if (cantidad <= 0) {
        alert('Valor ingresado no es válido, el número debe ser superior a 0.');
        return;
    }

    switch (eleccionMoneda) {
        case 'dolar':
            conversionDolar(cantidad);
            break;
        case 'euro':
            conversionEuro(cantidad);
            break;
        case 'bitcoin':
            conversionBitcoin(cantidad);
            break;
    }


    await renderGrafica(eleccionMoneda);
});


obtenerValores();
