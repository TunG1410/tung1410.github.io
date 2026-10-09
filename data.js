/* =====================================================================
   ★ SỬA THÔNG TIN CỦA BẠN Ở ĐÂY — DÙNG CHUNG CHO TẤT CẢ CÁC TRANG ★
   File này được tạo bởi chế độ chỉnh sửa lúc 20:15:24 9/10/2026.
   Bạn vẫn có thể sửa tay: chỉ thay chữ trong dấu ngoặc kép "...".
   - Để trống "" nếu không dùng (ví dụ chưa có trailer).
   - Ảnh: đặt vào thư mục "images" rồi ghi đường dẫn, ví dụ "images/game1.jpg".
     Nếu để trống, trang sẽ tự vẽ ảnh minh họa theo màu "color" của game.
   ===================================================================== */
const PROFILE = {
  name: "Ngô Đức Tùng",
  codename: "Gipsy",   // biệt danh, hiện dưới tên ở trang chủ và trên thẻ hồ sơ — để trống "" nếu không dùng
  role: "Game Developer",
  tagline: "Mình đang vibe code!!!",
  avatar: "",   // ví dụ "images/avatar.jpg" — để trống sẽ tự tạo ảnh chân dung
  cvFile: "",   // file CV để người xem tải về — để trống "" nếu không có
  level: 0.2,   // số năm kinh nghiệm
  className: "Dev",
  status: "Ready!!!",   // trạng thái hiện trên thẻ hồ sơ
  about: "Mình đang bắt đầu đây ...",

  // level từ 1 đến 10 — nên giữ 5 đến 8 kỹ năng để biểu đồ đẹp
  skills: [
    { name: "Unity / C#", level: 8 },
    { name: "Game design", level: 6 },
    { name: "Unity Agent", level: 1 },
    { name: "Blender", level: 1 },
    { name: "Làm việc nhóm", level: 7 }
  ],

  // Túi đồ: công cụ, xếp từ dùng nhiều nhất
  tools: ["Unity", "Git", "Blender", "Aseprite"],

  // status: "released" = Đã phát hành, "dev" = Đang phát triển
  // featured: true = game nổi bật trên trang chủ (chỉ chọn 1 game)
  // trailer: dán link YouTube để hiện video ngay trên trang chi tiết game
  // screenshots: ảnh chụp màn hình, ví dụ ["images/g1-1.jpg", "images/g1-2.jpg"]
  games: [
    {
      title: "Đèn Lồng Cuối Cùng",
      featured: true,
      status: "released",
      year: 2025,
      engine: "Unity",
      platform: "PC, Web",
      genres: ["Platformer", "Giải đố"],
      desc: "Một chú đom đóm nhỏ dẫn đường qua khu rừng tắt đèn. Mỗi màn chơi là một câu đố về ánh sáng và bóng tối, kèm nhạc nền tự sáng tác.",
      features: ["24 màn chơi giải đố ánh sáng", "Nhạc nền tự sáng tác", "Hỗ trợ tay cầm"],
      highlight: "Top 10 tại một game jam 48 giờ",
      itch: "https://itch.io",
      trailer: "",
      image: "",
      screenshots: [],
      color: "#FFC65C"
    },
    {
      title: "Neon Drift",
      featured: false,
      status: "released",
      year: 2024,
      engine: "Godot",
      platform: "Web",
      genres: ["Đua xe", "Arcade"],
      desc: "Game đua xe một nút bấm: drift qua thành phố neon, ăn combo để tăng tốc. Chơi được ngay trên trình duyệt.",
      features: ["Điều khiển một nút", "Bảng xếp hạng online", "10 đường đua"],
      highlight: "",
      itch: "https://itch.io",
      trailer: "",
      image: "",
      screenshots: [],
      color: "#FF4F9A"
    },
    {
      title: "Quán Trọ Ma",
      featured: false,
      status: "dev",
      year: 2026,
      engine: "Godot",
      platform: "PC",
      genres: ["Quản lý", "Cozy"],
      desc: "Mở quán trọ cho những hồn ma lạc đường. Nấu món ăn, nghe chuyện của họ và giúp họ siêu thoát.",
      features: ["Hơn 30 hồn ma với câu chuyện riêng", "Hệ thống nấu ăn", "Nâng cấp quán trọ"],
      highlight: "",
      itch: "",
      trailer: "",
      image: "",
      screenshots: [],
      color: "#5EF0C8"
    },
    {
      title: "Bão Cát",
      featured: false,
      status: "released",
      year: 2023,
      engine: "Unity",
      platform: "PC",
      genres: ["Sinh tồn", "Hành động"],
      desc: "Sống sót qua những cơn bão cát trên sa mạc hoang. Game làm trong 72 giờ cho một game jam.",
      features: ["Làm trong 72 giờ", "Thế giới tạo ngẫu nhiên"],
      highlight: "",
      itch: "https://itch.io",
      trailer: "",
      image: "",
      screenshots: [],
      color: "#FF7A45"
    }
  ],

  // Kinh nghiệm & học vấn, mới nhất ở trên. done: false = đang làm
  quests: [
    { time: "2023 – nay", title: "Nhà phát triển game", place: "Tự do", desc: "Thiết kế, lập trình game.", done: false },
    {
      time: "2022 – 2026",
      title: "Cử nhân Công nghệ thông tin",
      place: "Trường Đại học Giao thông vận tải",
      desc: "Đồ án tốt nghiệp: Đang làm.",
      done: false
    }
  ],
  contacts: [
    { label: "Email", value: "ductung141004@gmail.com", url: "mailto:ductung141004@gmail.com" },
    { label: "itch.io", value: "tungtung04.itch.io", url: "https://itch.io/dashboard" },
    { label: "GitHub", value: "github.com/TunGTun", url: "https://github.com/TunGTun" }
  ]
};

/* Khóa của chế độ chỉnh sửa: chỉ là mã băm, không chứa lệnh hay mật khẩu thật.
   Đừng sửa tay. Muốn đổi lệnh hoặc mật khẩu, dùng mục "Bảo mật" trong chế độ chỉnh sửa.
   Xóa khối này thì trang dùng lại lệnh và mật khẩu mặc định. */
const EDITOR_LOCK = {"v":1,"it":20000,"cs":"7c1e4a92d05b38f6","cmd":"f29a2236dc5833e73b64879f7371d9a86fd8dd7445bf97e0777fde84af2b3a37","ps":"e83b07d6a419c25f","pass":"feddb2e4722d715d8382bfe4b9a45588a6502cde219e37bcc5994d777fa47308"};
