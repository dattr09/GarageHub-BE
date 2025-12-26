const adminSockets = new Map(); // socketId -> socket (for admins and employees)

const initializeAppointmentSocket = (io) => {
  const appointmentNamespace = io.of("/appointments");

  appointmentNamespace.on("connection", (socket) => {
    console.log(`📅 Appointment client connected: ${socket.id}`);

    const userId = socket.handshake.query.userId;
    const role = socket.handshake.query.role; // "admin" hoặc "employee"

    // Chỉ admin và employee mới được kết nối
    if (role !== "admin" && role !== "employee") {
      console.log("❌ Unauthorized appointment socket connection, disconnecting");
      socket.disconnect();
      return;
    }

    // Lưu thông tin socket của admin/employee
    adminSockets.set(socket.id, socket);
    console.log(`👨‍💼 ${role} connected to appointment socket: ${socket.id}`);

    // Join vào room chung để nhận thông báo
    socket.join("admin-room");

    socket.on("disconnect", () => {
      adminSockets.delete(socket.id);
      console.log(`📅 Appointment client disconnected: ${socket.id}`);
    });
  });

  // Hàm để gửi thông báo lịch hẹn mới cho tất cả admin/employee
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
    console.log(`📢 Notified admin/employees about new appointment: ${appointment._id}`);
  };

  return {
    notifyNewAppointment,
    getActiveAdminsCount: () => adminSockets.size,
  };
};

module.exports = initializeAppointmentSocket;

