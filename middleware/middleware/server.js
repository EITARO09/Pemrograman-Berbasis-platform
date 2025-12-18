const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'rahasia_negara_api'; // Gunakan key yang rumit di production

// Middleware untuk membaca JSON dari body request
app.use(bodyParser.json());

// --- DATABASE SEMENTARA (Mock Data) ---
const users = [];       // Menyimpan user
const activities = [];  // Menyimpan kegiatan
let userIdCounter = 1;
let activityIdCounter = 1;

// ==========================================
// 1. MIDDLEWARE (Wajib Sesuai Soal)
// ==========================================

// [Middleware 1] Request Logger: Mencatat setiap request yang masuk
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[LOG] ${timestamp} | ${req.method} ${req.url}`);
    next();
};
app.use(requestLogger); // Pasang secara global

// [Middleware 2] Auth Middleware: Mengecek Token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Token biasanya dikirim dalam format: "Bearer <token_disini>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token tidak valid atau kadaluwarsa.' });
        }
        req.user = user; // Simpan data user ke dalam request agar bisa dipakai di route berikutnya
        next();
    });
};

// [Middleware 3] Role Middleware: Mengecek apakah user Mahasiswa atau Admin
const authorizeRole = (allowedRole) => {
    return (req, res, next) => {
        if (req.user.role !== allowedRole) {
            return res.status(403).json({ message: `Akses terlarang. Halaman ini khusus ${allowedRole}.` });
        }
        next();
    };
};

// [Middleware 4] Activity Validation: Validasi input saat membuat kegiatan
const validateActivityInput = (req, res, next) => {
    const { title, description, date } = req.body;
    if (!title || !description || !date) {
        return res.status(400).json({ message: 'Data tidak lengkap. Title, description, dan date wajib diisi.' });
    }
    next();
};

// ==========================================
// 2. ROUTES / ENDPOINT
// ==========================================

// [ROUTE BARU] Halaman Depan (Agar tidak error "Cannot GET /" di browser)
app.get('/', (req, res) => {
    res.json({
        message: "Selamat Datang di API Manajemen Kegiatan Mahasiswa",
        status: "Server Berjalan Normal",
        panduan: "Gunakan Postman untuk melakukan Register/Login."
    });
});

// 1. Register User (Bisa untuk Admin atau Mahasiswa)
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!['mahasiswa', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Role harus "mahasiswa" atau "admin"' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
        id: userIdCounter++,
        username,
        password: hashedPassword,
        role
    };
    
    users.push(newUser);
    res.status(201).json({ message: 'Registrasi berhasil', user: { id: newUser.id, username, role } });
});

// 2. Login User
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: 'User tidak ditemukan' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Password salah' });
    }

    // Membuat Token JWT
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    
    res.json({ message: 'Login berhasil', token });
});

// 3. Melihat Daftar Kegiatan (Bisa diakses Admin & Mahasiswa)
app.get('/activities', authenticateToken, (req, res) => {
    res.json(activities);
});

// 4. Menambah Kegiatan (Hanya Admin)
app.post('/activities', authenticateToken, authorizeRole('admin'), validateActivityInput, (req, res) => {
    const { title, description, date } = req.body;
    
    const newActivity = {
        id: activityIdCounter++,
        title,
        description,
        date,
        participants: [] // Array untuk menyimpan siapa saja yang join
    };
    
    activities.push(newActivity);
    res.status(201).json({ message: 'Kegiatan berhasil dibuat', activity: newActivity });
});

// 5. Update Kegiatan (Hanya Admin)
app.put('/activities/:id', authenticateToken, authorizeRole('admin'), validateActivityInput, (req, res) => {
    const id = parseInt(req.params.id); // Ubah ID dari URL jadi angka
    const activityIndex = activities.findIndex(a => a.id === id);

    if (activityIndex === -1) {
        return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }

    // Update data (pertahankan participants yang lama)
    activities[activityIndex] = {
        ...activities[activityIndex],
        ...req.body
    };

    res.json({ message: 'Kegiatan berhasil diupdate', activity: activities[activityIndex] });
});

// 6. Join Kegiatan (Hanya Mahasiswa)
app.post('/activities/:id/join', authenticateToken, authorizeRole('mahasiswa'), (req, res) => {
    const id = parseInt(req.params.id);
    const activity = activities.find(a => a.id === id);

    if (!activity) {
        return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }

    // Cek apakah mahasiswa sudah terdaftar
    const alreadyJoined = activity.participants.some(p => p.userId === req.user.id);
    if (alreadyJoined) {
        return res.status(400).json({ message: 'Anda sudah mendaftar di kegiatan ini' });
    }

    activity.participants.push({
        userId: req.user.id,
        username: req.user.username,
        joinedAt: new Date().toISOString()
    });

    res.json({ message: 'Berhasil mendaftar kegiatan', activityTitle: activity.title });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`Server Berjalan di http://localhost:${PORT}`);
    console.log(`Tips: Buka browser untuk cek koneksi awal.`);
    console.log(`=================================================`);
});