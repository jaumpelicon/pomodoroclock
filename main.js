//Atualizando o temporizador
const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0,
  };
  
  let interval; 

  //Som do botão
  const buttonSound = new Audio('button-sound.mp3');
  //Botão Começar
  const mainButton = document.getElementById('js-btn');
  mainButton.addEventListener('click', () => {
    buttonSound.play();
    const { action } = mainButton.dataset;
    if (action === 'começar') {
      startTimer();
    } else {
      stopTimer();
    }
  });
  //Atualizando contagem regressiva de forma apropriada
  const modeButtons = document.querySelector('#js-mode-buttons');
  modeButtons.addEventListener('click', handleMode);
  
  function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;
  
    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);
  
    return {
      total,
      minutes,
      seconds,
    };
  }
  //iniciando temporizador
  function startTimer() {
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;
  
    if (timer.mode === 'pomodoro') timer.sessions++; // Incrementando sessões de pomodoro a cada 4 ocorre uma longa pausa
  
    mainButton.dataset.action = 'parar';
    mainButton.textContent = 'parar';
    mainButton.classList.add('active');
  
    interval = setInterval(function() {
      timer.remainingTime = getRemainingTime(endTime);
      updateClock();
  
      total = timer.remainingTime.total;
      if (total <= 0) {
        clearInterval(interval);
  
        switch (timer.mode) {
          case 'pomodoro':
            if (timer.sessions % timer.longBreakInterval === 0) {
              switchMode('pausaLonga');
            } else {
              switchMode('pausaCurta');
            }
            break;
          default:
            switchMode('pomodoro');
        }
  
        if (Notification.permission === 'permitido') {
          const text =
            timer.mode === 'pomodoro' ? 'Volte ao trabalho!' : 'Faça uma pausa!';
          new Notification(text);
        }
  
        document.querySelector(`[data-sound="${timer.mode}"]`).play();
  
        startTimer();
      }
    }, 1000);
  }
  //Função para parar o temporizador
  function stopTimer() {
    clearInterval(interval);
  
    mainButton.dataset.action = 'começar';
    mainButton.textContent = 'começar';
    mainButton.classList.remove('active');
  }
  //Função que faz parte da contagem regressiva 
  function updateClock() {
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');
  
    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;
  //mostrando contagem no titulo da pagina
    const text = timer.mode === 'pomodoro' ? 'Volte ao trabalho!' : 'Faça uma pausa!';
    document.title = `${minutes}:${seconds} — ${text}`;
    //atualizando barra de progresso
    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
  }
  //função para adicionar duas propriedades ao objeto (modo atual / modo temporizador)
  function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
      total: timer[mode] * 60,
      minutes: timer[mode],
      seconds: 0,
    };
  
    document
      .querySelectorAll('button[data-mode]')
      .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    document
      .getElementById('js-progress')
      .setAttribute('max', timer.remainingTime.total);
  
    updateClock();
  }
  //Função para parar temporizador quando trocar de modo
  function handleMode(event) {
    const { mode } = event.target.dataset;
  
    if (!mode) return;
  
    switchMode(mode);
    stopTimer();
  }
  //Exibindo notificações
  document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
      if (
        Notification.permission !== 'permitido' &&
        Notification.permission !== 'negado'
      ) {
        Notification.requestPermission().then(function(permission) {
          if (permission === 'permitido') {
            new Notification(
              'incrível! Você será notificado no início de cada sessão'
            );
          }
        });
      }
    }
  
    switchMode('pomodoro');
  });