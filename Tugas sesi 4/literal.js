// Membuat objek film menggunakan Object Literal
const film = {
  judul: "Interstellar",
  tahunRilis: 2014,
  sutradara: "Christopher Nolan",
  genre: ["Sci-Fi", "Adventure", "Drama"],

  // Method untuk menampilkan detail film
  tampilkanDetail: function () {
    return `Judul: ${this.judul}
Tahun Rilis: ${this.tahunRilis}
Sutradara: ${this.sutradara}
Genre: ${this.genre.join(", ")}`;
  },
};

// Akses dan tampilkan data
console.log("Sutradara:", film.sutradara);
console.log("Genre ke-2:", film.genre[1]);
console.log("\nDetail Film:\n" + film.tampilkanDetail());
