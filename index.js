import { Server } from 'socket.io';
import si from 'systeminformation';

const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`Servidor Socket.IO en funcionamiento (${NODE_ENV})\n`);

const io = new Server({
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log(`Conectado: ${socket.id}`, socket.request.headers);

  const sendSystemData = async () => {
    try {
      const uptimeData = si.time();
      const uptime = formatUptime(uptimeData.uptime);

      const cpuData = await si.currentLoad();
      const cpuPercentage = cpuData.currentLoad.toFixed(0);

      const memData = await si.mem();
      const totalMemory = memData.total / (1024 * 1024);
      const usedMemory = memData.active / (1024 * 1024);
      const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(0);

      socket.emit('systemData', {
        uptime: uptime,
        cpuUsage: `${cpuPercentage}%`,
        memoryUsage: `${memoryUsage}%`,
      });
    } catch (error) {
      console.error('Error obteniendo datos del sistema:', error);
    }
  };

  const intervalId = setInterval(sendSystemData, 1000);

  socket.on('disconnect', (reason) => {
    console.log(`Desconectado: ${socket.id}`);
    console.log(`Razón: ${reason} \n`);
    clearInterval(intervalId);
  });
});

io.listen(3000);

function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '< 1m';
}
