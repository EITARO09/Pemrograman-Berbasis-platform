// Deklarasi variabel nilai
let matematika = 85;
let bahasaInggris = 90;
let ipa = 78;

// Hitung nilai rata-rata
let nilaiRataRata = (matematika + bahasaInggris + ipa) / 3;

// Tampilkan hasil rata-rata dan tipe data
console.log("Nilai Rata-Rata:", nilaiRataRata);
console.log("Tipe Data:", typeof nilaiRataRata);

// Tentukan status kelulusan
if (nilaiRataRata >= 80) {
  console.log("Status: Lulus");
} else {
  console.log("Status: Tidak Lulus");
}
