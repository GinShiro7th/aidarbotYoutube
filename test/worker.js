// worker.js
const { parentPort, workerData } = require('worker_threads');

function performTask(data) {
  // Ваша логика выполнения задачи
  // Например, вы можете выполнить какие-то вычисления или операции над данными
  const result = data * 2;

  // Отправьте результат обратно в главный поток
  parentPort.postMessage(result);
}

// Прослушиваем сообщения от главного потока
parentPort.on('message', (data) => {
  performTask(data);
});
