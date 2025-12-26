const adminSockets = new Map();

const initializeAppointmentSocket = (io) => {

  const appointmentNamespace = io.of("/appointments");

  appointmentNamespace.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const role = socket.handshake.query.role;

    if (role !== "admin" && role !== "employee") {
      socket.disconnect();
      return;
    }

    adminSockets.set(socket.id, socket);

    socket.join("admin-room");

    socket.on("disconnect", () => {
      adminSockets.delete(socket.id);
    });
  });

  const notifyNewAppointment = (appointment) => {
    appointmentNamespace.to("admin-room").emit("new-appointment", {
      type: "new-appointment",
      message: `Có lịch hẹn mới từ ${appointment.customerName} - ${appointment.phone}`,
      appointment: {
        _id: appointment._id,
        customerName: appointment.customerName,
        phone: appointment.phone,
        date: appointment.date,
        time: appointment.time,
        vehicleType: appointment.vehicleType,
        services: appointment.services,
        status: appointment.status,
        createdAt: appointment.createdAt,
      },
      timestamp: new Date(),
    });
  };

  return {
    notifyNewAppointment,
    getActiveAdminsCount: () => adminSockets.size,
  };
};

module.exports = initializeAppointmentSocket;

