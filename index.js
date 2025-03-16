import { Server } from 'socket.io';
import si from 'systeminformation';

console.log('Servidor Socket.IO en funcionamiento');

const io = new Server({
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log(`Conectado: ${socket.id}`, socket.request.headers);

  const sendSystemData = async () => {
    const currentTime = new Date().toLocaleTimeString();

    try {
      // Obtener uso de CPU
      const cpuData = await si.currentLoad();
      const cpuPercentage = cpuData.currentLoad.toFixed(0); // Porcentaje de uso de CPU

      // Obtener uso de memoria
      const memData = await si.mem();
      const totalMemory = memData.total / (1024 * 1024); // Convertir de bytes a MB
      const usedMemory = memData.active / (1024 * 1024); // Convertir de bytes a MB
      const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(0); // Porcentaje de memoria usada

      // Enviar datos al cliente
      socket.emit('systemData', {
        time: currentTime,
        cpuUsage: cpuPercentage,
        memoryUsage: memoryUsage,
      });
    } catch (error) {
      console.error('Error obteniendo datos del sistema:', error);
    }
  };

  // Enviar datos cada segundo
  const intervalId = setInterval(sendSystemData, 1000);

  socket.on('disconnect', (reason) => {
    console.log(`Desconectado: ${socket.id}`);
    console.log(`Razón: ${reason} \n`);
    clearInterval(intervalId);
  });
});

io.listen(3000);
