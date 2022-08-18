// Variaveis "globais" pois são utilizadas em diversos lugares.
let correctNumber = 0;
const numberStatus = document.getElementById('number-status');

// Gerando o número a ser descoberto aleatoriamente
const getRandomNumber = () => {
    const minNumber = 1;
    const maxNumber = 300;

    // Promise do endpoint
    fetch(`https://us-central1-ss-devops.cloudfunctions.net/rand?min=${minNumber}&max=${maxNumber}`)
        .then((response) => {
            return response.json()
        })
        .then((data) => {
            // Caso sucesso, setamos o número a ser descoberto.
            if (data.value) {
                correctNumber = parseInt(data.value);
            } else {
                // caso retorne erro, exibimos a mensagem de erro, em CAPS LOCK, 
                // chamamos a função para preenchimento do LED (passando um parametro com o numero e outro de erro)
                // e exibimos o botão de Nova partida
                numberStatus.innerHTML = "Erro";
                numberStatus.setAttribute("style", "text-transform: uppercase;");
                handleFill(data.StatusCode, true);
                handleRefreshButton();
            };
        }).catch((err) => console.log(err))
}
// Rendizerando ao iniciar a página
getRandomNumber();

// Função para preenchimento do LED
const handleFill = (number, hasError, winner) => {
    // Resetando as cores variaveis para seu estado inicial
    document.documentElement.style.setProperty('--numberFillColor', 'black');
    document.documentElement.style.setProperty('--numberStatus', 'FF6600');

    // Descobrindo quantos números precisaremos no LED
    const totalElement = number.toString().split('');

    // Caso receba como parametro um erro, os numeros e o status deverão ser vermelhos
    if (hasError) {
        document.documentElement.style.setProperty('--numberFillColor', '#CC3300');
        document.documentElement.style.setProperty('--numberStatus', '#CC3300');
    }

    // Caso o usuario tenha descoberto o número, setamos as variaveis para verde.
    if (winner) {
        document.documentElement.style.setProperty('--numberStatus', '#32BF00');
        document.documentElement.style.setProperty('--numberFillColor', '#32BF00');
    }
 
    //Sempre que chamamos essa função, ele deve ter como estado inicial apenas 1 número (0)
    const numbersContent = document.getElementById('numbers-content');
    numbersContent.innerHTML = `
        <svg id="number-1" class="num-0" width="130" height="240" viewBox="0 0 260 480">
            <use xlink:href="#unit-h" class="segment a" x="30" y="0"></use>
            <use xlink:href="#unit-v" class="segment b" x="220" y="30"></use>
            <use xlink:href="#unit-v" class="segment c" x="220" y="250"></use>
            <use xlink:href="#unit-h" class="segment d" x="30" y="440"></use>
            <use xlink:href="#unit-v" class="segment e" x="0" y="250"></use>
            <use xlink:href="#unit-v" class="segment f" x="0" y="30"></use>
            <use xlink:href="#unit-h" class="segment g" x="30" y="220"></use>
        </svg>
    `
    document.getElementById('number-1').setAttribute("class", "num-" + totalElement[0]);

    // Gerando os números para o painel de acordo com o que foi digitado no input
    // Percorremos o tamanho do número MENOS UM devido a SEMPRE termos ja 1 elemento em tela.
    // O LED recebe ele mesmo, mais as interações do loop.
    // Para cada intereção do loop, adicionamos as classes dinamicamente.
    // Os Ids dinamicos recebem + 2 devido a ja termos 1 elemento em tela com o ID 1 e o contador se inicia em 0.
    for (let i = 0; i < totalElement.length - 1; i++) {
        numbersContent.innerHTML += `
        <svg id="number-${i + 2}" class="num-0" width="130" height="240" viewBox="0 0 260 480">
            <use xlink:href="#unit-h" class="segment a" x="30" y="0"></use>
            <use xlink:href="#unit-v" class="segment b" x="220" y="30"></use>
            <use xlink:href="#unit-v" class="segment c" x="220" y="250"></use>
            <use xlink:href="#unit-h" class="segment d" x="30" y="440"></use>
            <use xlink:href="#unit-v" class="segment e" x="0" y="250"></use>
            <use xlink:href="#unit-v" class="segment f" x="0" y="30"></use>
            <use xlink:href="#unit-h" class="segment g" x="30" y="220"></use>
        </svg>
        `
        // Recuperamos o elemento criado, e setamos a classe (1 classe por numero) dinamicamente de acordo com a posicao i + 1 devido ao contador iniciar em 0.
        document.getElementById(`number-${i + 2}`).setAttribute("class", "num-" + totalElement[i + 1]);
    }

}

// Recuperando o botão principal
const btn = document.getElementById('main-button');
// Adicionando Evento de click
btn.addEventListener("click", () => {
    // Recuperando o valor do input
    const inputValue = parseInt(document.getElementById('selected-number').value);

    // Atualizando o HTML de status de acordo com o número digitado e também atualizando o LED
    if (inputValue < correctNumber) {
        numberStatus.innerHTML = "É maior"
        handleFill(inputValue);
    } else if (inputValue > correctNumber) {
        numberStatus.innerHTML = "É menor"
        handleFill(inputValue);
    } else if (inputValue === correctNumber) {
        // Caso o numero digitado for o mesmo do numero recuperado do endpoint, alem de atualizarmos o status e o LED, exibimos o botão de nova partida.
        numberStatus.innerHTML = "Você acertou!!!"
        handleFill(inputValue, false, true);
        handleRefreshButton();
    }

    // Resetando para o estado inicial
    document.getElementById('selected-number').value = '';
});

// Exibindo o botão de Nova Partida
const handleRefreshButton = () => {
    // Lugar onde deverá ser exibido o botão de Nova Partida
    const buttonContainer = document.getElementById('refresh-button_container');

    // Desabilitando o botão principal e tambem o input do palpite
    const shouldDisableMainButton = document.getElementById('main-button');
    const shouldDisableSelectedNumberInput = document.getElementById('selected-number');
    shouldDisableMainButton.disabled = true;
    shouldDisableSelectedNumberInput.disabled = true;

    // Renderizando o botão de Nova Partida
    buttonContainer.innerHTML = `
    <button class="refresh-button" id="refresh-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path
                    d="M496 48V192c0 17.69-14.31 32-32 32H320c-17.69 0-32-14.31-32-32s14.31-32 32-32h63.39c-29.97-39.7-77.25-63.78-127.6-63.78C167.7 96.22 96 167.9 96 256s71.69 159.8 159.8 159.8c34.88 0 68.03-11.03 95.88-31.94c14.22-10.53 34.22-7.75 44.81 6.375c10.59 14.16 7.75 34.22-6.375 44.81c-39.03 29.28-85.36 44.86-134.2 44.86C132.5 479.9 32 379.4 32 256s100.5-223.9 223.9-223.9c69.15 0 134 32.47 176.1 86.12V48c0-17.69 14.31-32 32-32S496 30.31 496 48z" />
            </svg>
            Nova Partida</button>
    `
    // Adicionando evento de click no botão de nova Partida
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.addEventListener('click', () => {
        // Ao clicar em Nova Partida
        // Fazemos uma nova chamada no endpoint para um novo número a ser descoberto.
        getRandomNumber();
        // Deixamos de exibir o botão de Nova Partida
        buttonContainer.innerHTML = ``;
        // Habilitamos o input e o botao novamente 
        shouldDisableMainButton.disabled = false;
        shouldDisableSelectedNumberInput.disabled = false;
        // Exibimos no LED o número 0 (estado inicial)
        handleFill(0);
        // Resetando o status do número
        numberStatus.innerHTML = ``;
    })
}