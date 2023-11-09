const { Worker, isMainThread } = require("worker_threads");
const cookies = require("../cookies.json");

module.exports = async function (url) {
  if (isMainThread) {
    // Этот код выполняется в главном потоке

    const numBrowsers = cookies.length / 5; // Здесь указываете, сколько браузеров нужно создать
    const workers = [];

    for (let i = 0; i < numBrowsers; i++) {
      const worker = new Worker("./writeComment/worker.js", {
        workerData: {
          cookies: cookies.slice(i * 5, (i + 1) * 5),
          url,
        },
      });

      worker.on("message", (message) => {
        if (message.status === "done") {
          console.log(`Рабочий поток браузера ${i} завершил работу.`);
        } else if (message.status === 'error'){
          console.log(`ошибка в рабочем потоке браузера ${i} - ${message.errMsg}`);
        }
      });

      workers.push(worker);
    }
    return;
  } else {
    // Этот код не будет выполняться в главном потоке
  }
};
