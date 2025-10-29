const express = require("express");
const app = express();
const path = require("path");
const { PORT, FRONTEND_URL } = require("./config/envVars");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser"); // Import body-parser
const http = require("http");

// Cấu hình CORS
const corsOptions = {
  origin: [FRONTEND_URL, "http://192.168.2.245:5173"], // Change this to your frontend's URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  credentials: true, // Allow credentials
};

app.use(morgan("dev"));
app.use(cors(corsOptions));

// Tăng giới hạn kích thước payload
app.use(bodyParser.json({ limit: "10mb" })); // Cho phép payload tối đa 10MB
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cookieParser());

// Serve static files from public directory (path already set up)
app.use(express.static(path.join(__dirname, "public")));

// Sử dụng các route
app.use("/api/v1", require("./routes/index"));

app.use("/", (req, res) => {
  res.send("API is running");
});

const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started at http://localhost:${PORT}`);
  connectDB();
});
