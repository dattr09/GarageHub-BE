const Appointment = require("../models/appointmentModel");

// Hàm helper để gửi thông báo socket
const notifyNewAppointment = (req, appointment) => {
  try {
    const appointmentSocket = req.app.get("appointmentSocket");
    if (appointmentSocket && appointmentSocket.notifyNewAppointment) {
      appointmentSocket.notifyNewAppointment(appointment);
    }
  } catch (error) {
    console.error("Error sending appointment notification:", error);
  }
};

// Hằng số: số lượng xe tối đa trong mỗi khung giờ
const MAX_APPOINTMENTS_PER_SLOT = 3;

// Tạo lịch hẹn mới
exports.createAppointment = async (req, res) => {
  try {
    const { customerName, phone, email, date, time, vehicleType, services, note } = req.body;

    // Validate dữ liệu cơ bản
    if (!customerName || !phone || !date || !time || !vehicleType || !services || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc",
      });
    }

    // Kiểm tra ngày không được là quá khứ
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    if (appointmentDate < today) {
      return res.status(400).json({
        success: false,
        message: "Không thể đặt lịch cho ngày trong quá khứ",
      });
    }

    // Kiểm tra số lượng lịch trong khung giờ này
    const existingAppointments = await Appointment.countDocuments({
      date: appointmentDate,
      time: time,
      status: { $nin: ["Hủy"] }, // Không tính các lịch đã hủy
    });

    if (existingAppointments >= MAX_APPOINTMENTS_PER_SLOT) {
      return res.status(400).json({
        success: false,
        message: `Khung giờ ${time} ngày ${appointmentDate.toLocaleDateString("vi-VN")} đã đầy. Vui lòng chọn khung giờ khác.`,
      });
    }

    // Tạo lịch hẹn mới
    const newAppointment = new Appointment({
      customerName,
      phone,
      email: email || "",
      date: appointmentDate,
      time,
      vehicleType,
      services,
      note: note || "",
      status: "Chờ xác nhận",
    });

    const savedAppointment = await newAppointment.save();

    // Gửi thông báo cho admin/employee qua socket
    notifyNewAppointment(req, savedAppointment);

    res.status(201).json({
      success: true,
      message: "Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.",
      data: savedAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Đặt lịch thất bại",
      error: error.message,
    });
  }
};

// Lấy tất cả lịch hẹn (cho admin/employee)
exports.getAllAppointments = async (req, res) => {
  try {
    const { date, status, page = 1, limit = 50 } = req.query;
    let filter = {};

    // Lọc theo ngày nếu có
    if (date) {
      const filterDate = new Date(date);
      filterDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(filterDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.date = {
        $gte: filterDate,
        $lt: nextDay,
      };
    }

    // Lọc theo status nếu có
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const appointments = await Appointment.find(filter)
      .sort({ date: 1, time: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error getting appointments:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách lịch hẹn",
      error: error.message,
    });
  }
};

// Lấy lịch hẹn theo ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error getting appointment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật trạng thái lịch hẹn
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Chờ xác nhận", "Đã xác nhận", "Đang sửa", "Hoàn thành", "Hủy"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Cập nhật thất bại",
      error: error.message,
    });
  }
};

// Tìm lịch hẹn theo số điện thoại (để khách hàng xem và hủy)
exports.getAppointmentsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập số điện thoại",
      });
    }

    const appointments = await Appointment.find({ phone })
      .sort({ date: -1, time: -1 })
      .limit(20); // Giới hạn 20 lịch gần nhất

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error getting appointments by phone:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Hủy lịch hẹn (công khai, không cần đăng nhập)
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone } = req.body; // Xác thực bằng số điện thoại

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    // Kiểm tra số điện thoại có khớp không
    if (appointment.phone !== phone) {
      return res.status(403).json({
        success: false,
        message: "Số điện thoại không khớp với lịch hẹn này",
      });
    }

    // Chỉ cho phép hủy nếu chưa hoàn thành
    if (appointment.status === "Hoàn thành") {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy lịch hẹn đã hoàn thành",
      });
    }

    appointment.status = "Hủy";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Hủy lịch hẹn thành công",
      data: appointment,
    });
  } catch (error) {
    console.error("Error canceling appointment:", error);
    res.status(500).json({
      success: false,
      message: "Hủy lịch hẹn thất bại",
      error: error.message,
    });
  }
};

// Lấy số lượng lịch hẹn theo ngày và giờ (để kiểm tra khả dụng)
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ngày",
      });
    }

    const filterDate = new Date(date);
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Lấy tất cả lịch hẹn trong ngày
    const appointments = await Appointment.find({
      date: {
        $gte: filterDate,
        $lt: nextDay,
      },
      status: { $nin: ["Hủy"] },
    });

    // Nhóm theo giờ và đếm số lượng
    const slotCounts = {};
    appointments.forEach((apt) => {
      if (!slotCounts[apt.time]) {
        slotCounts[apt.time] = 0;
      }
      slotCounts[apt.time]++;
    });

    // Tạo danh sách các khung giờ với thông tin khả dụng
    const timeSlots = [
      "08:00", "09:00", "10:00", "11:00",
      "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    const availableSlots = timeSlots.map((time) => ({
      time,
      count: slotCounts[time] || 0,
      available: (slotCounts[time] || 0) < MAX_APPOINTMENTS_PER_SLOT,
      maxSlots: MAX_APPOINTMENTS_PER_SLOT,
    }));

    res.status(200).json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error("Error getting available slots:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

