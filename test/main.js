// main.js
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  // Этот код выполняется в главном потоке

  // Создадим 10 рабочих потоков
  const numWorkers = 10;
  const workers = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('./test/worker.js', {
      workerData: i, // Передаем данные в рабочий поток, если нужно
    });

    worker.on('message', (result) => {
      console.log(`Результат из рабочего потока ${i}: ${result}`);
    });

    workers.push(worker);
  }

  // Отправляем данные в рабочие потоки
  for (let i = 0; i < numWorkers; i++) {
    workers[i].postMessage(i);
  }
} else {
  console.log('123');
}
