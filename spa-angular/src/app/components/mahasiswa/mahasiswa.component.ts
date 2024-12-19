import { CommonModule } from '@angular/common'; // Mengimpor modul Angular yang menyediakan direktif umum seperti ngIf, ngFor, dll.
import { Component, OnInit, inject } from '@angular/core'; // Mengimpor decorator Component, interface OnInit untuk inisialisasi, dan inject untuk injeksi dependency.
import { HttpClient } from '@angular/common/http'; // Mengimpor HttpClient untuk melakukan HTTP request ke server.
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // Mengimpor modul dan class untuk membuat formulir reaktif.
import * as bootstrap from 'bootstrap'; // Mengimpor Bootstrap untuk manipulasi modal dan elemen lainnya.
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-mahasiswa', // Selector untuk komponen ini digunakan dalam template HTML.
  standalone: true, // Menjadikan komponen ini sebagai standalone, tanpa bagian dari modul Angular lainnya.
  imports: [CommonModule, ReactiveFormsModule, NgxPaginationModule], // Mengimpor modul Angular yang dibutuhkan untuk komponen ini.
  templateUrl: './mahasiswa.component.html', // Lokasi file template HTML untuk komponen ini.
  styleUrls: ['./mahasiswa.component.css'], // Lokasi file CSS untuk komponen ini.
})
export class MahasiswaComponent implements OnInit {
  // Mendeklarasikan class komponen dengan implementasi OnInit untuk inisialisasi.
  mahasiswa: any[] = [];
  prodi: any[] = []; // Menyimpan data program studi dropdown.
  backendUrl = 'https://belajar-express-generator.vercel.app';
  apiMahasiswaUrl =
    'https://belajar-express-generator.vercel.app/api/mahasiswa';
  apiProdiUrl = 'https://belajar-express-generator.vercel.app/api/prodi'; // URL API untuk mengambil dan menambahkan data prodi.
  isLoading = true; // Indikator loading data dari API.
  mahasiswaForm: FormGroup; // Form group untuk formulir reaktif prodi.
  isSubmitting = false; // Indikator proses pengiriman data.

  jenisKelamin = ['L', 'P'];
  currentPage = 1;
  itemsPerPage = 5;

  private http = inject(HttpClient); // Menggunakan Angular inject API untuk menyuntikkan HttpClient.
  private fb = inject(FormBuilder); // Menyuntikkan FormBuilder untuk membangun form reaktif.

  constructor() {
    // Konstruktor untuk inisialisasi komponen.
    this.mahasiswaForm = this.fb.group({
      // Membuat grup form dengan FormBuilder.
      npm: [''],
      nama: [''],
      prodi_id: [null],
      jenis_kelamin: [''],
      asal_sekolah: [''],
      // foto: [''],
    });
  }

  ngOnInit(): void {
    // Lifecycle method Angular, dipanggil saat komponen diinisialisasi.
    this.getMahasiswa();
    this.getProdi(); // Memanggil fungsi untuk mengambil data prodi.
  }

  getMahasiswa(): void {
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(this.apiMahasiswaUrl, { headers }).subscribe({
      // Melakukan HTTP GET ke API prodi.
      next: (data) => {
        // Callback jika request berhasil.
        this.mahasiswa = data; // Menyimpan data prodi ke variabel.
        this.isLoading = false; // Menonaktifkan indikator loading.
        console.log(this.mahasiswa);
      },
      error: (err) => {
        // Callback jika request gagal.
        console.error('Error fetching prodi data:', err); // Log error ke konsol.
        this.isLoading = false; // Menonaktifkan indikator loading.
      },
    });
  }

  // Mengambil data program studi
  getProdi(): void {
    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get<any[]>(this.apiProdiUrl, { headers }).subscribe({
      // Melakukan HTTP GET ke API prodi.
      next: (data) => {
        // Callback jika request berhasil.
        this.prodi = data; // Menyimpan data prodi ke variabel.
        this.isLoading = false; // Menonaktifkan indikator loading.
      },
      error: (err) => {
        // Callback jika request gagal.
        console.error('Error fetching prodi data:', err); // Log error ke konsol.
        this.isLoading = false; // Menonaktifkan indikator loading.
      },
    });
  }

  editMahasiswaId: string | null = null; // ID Mahasiswa yang sedang diubah

  // Method untuk mendapatkan data Mahasiswa berdasarkan ID
  getMahasiswaById(_id: string): void {
    this.editMahasiswaId = _id; // Menyimpan ID Mahasiswa yang dipilih

    const token = localStorage.getItem('authToken');
    const headers = { Authorization: `Bearer ${token}` };

    this.http.get(`${this.apiMahasiswaUrl}/${_id}`, { headers }).subscribe({
      next: (data: any) => {
        // Isi form dengan data yang diterima dari API
        this.mahasiswaForm.patchValue({
          npm: data.npm,
          nama: data.nama,
          jenis_kelamin: data.jenis_kelamin,
          asal_sekolah: data.asal_sekolah,
          prodi_id: data.prodi_id,
        });

        // Buka modal edit
        const modalElement = document.getElementById(
          'editMahasiswaModal'
        ) as HTMLElement;
        if (modalElement) {
          const modalInstance =
            bootstrap.Modal.getInstance(modalElement) ||
            new bootstrap.Modal(modalElement);
          modalInstance.show();
        }
      },
      error: (err) => {
        console.error('Error fetching mahasiswa data by ID:', err);
      },
    });
  }

  // Method untuk menambahkan prodi
  addMahasiswa(): void {
    if (this.mahasiswaForm.valid) {
      // Memastikan form valid sebelum mengirim data.
      this.isSubmitting = true; // Mengaktifkan indikator pengiriman data.

      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      this.http
        .post(this.apiMahasiswaUrl, this.mahasiswaForm.value, { headers })
        .subscribe({
          // Melakukan HTTP POST ke API prodi.
          next: (response) => {
            // Callback jika request berhasil.
            console.log('Prodi berhasil ditambahkan:', response); // Log respons ke konsol.
            this.getMahasiswa(); // Refresh data prodi setelah penambahan.
            this.mahasiswaForm.reset(); // Reset form setelah data dikirim.
            this.isSubmitting = false; // Menonaktifkan indikator pengiriman.

            // Tutup modal setelah data berhasil ditambahkan
            const modalElement = document.getElementById(
              'tambahMahasiswaModal'
            ) as HTMLElement; // Ambil elemen modal berdasarkan ID.
            if (modalElement) {
              // Periksa jika elemen modal ada.
              const modalInstance =
                bootstrap.Modal.getInstance(modalElement) ||
                new bootstrap.Modal(modalElement); // Ambil atau buat instance modal.
              modalInstance.hide(); // Sembunyikan modal.

              // Pastikan untuk menghapus atribut dan gaya pada body setelah modal ditutup
              modalElement.addEventListener(
                'hidden.bs.modal',
                () => {
                  // Tambahkan event listener untuk modal yang ditutup.
                  const backdrop = document.querySelector('.modal-backdrop'); // Cari elemen backdrop modal.
                  if (backdrop) {
                    backdrop.remove(); // Hapus backdrop jika ada.
                  }

                  // Pulihkan scroll pada body
                  document.body.classList.remove('modal-open'); // Hapus class 'modal-open' dari body.
                  document.body.style.overflow = ''; // Pulihkan properti overflow pada body.
                  document.body.style.paddingRight = ''; // Pulihkan padding body.
                },
                { once: true }
              ); // Event listener hanya dijalankan sekali.
            }
          },
          error: (err) => {
            // Callback jika request gagal.
            console.error('Error menambahkan mahasiswa:', err); // Log error ke konsol.
            this.isSubmitting = false; // Menonaktifkan indikator pengiriman.
          },
        });
    }
  }

  // Method untuk mengupdate data prodi
  updateMahasiswa(): void {
    if (this.mahasiswaForm.valid) {
      this.isSubmitting = true;

      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };

      this.http
        .put(
          `${this.apiMahasiswaUrl}/${this.editMahasiswaId}`,
          this.mahasiswaForm.value,
          { headers }
        )
        .subscribe({
          next: (response) => {
            console.log('Mahasiswa berhasil diperbarui:', response);
            this.getMahasiswa();
            // this.getProdi();
            this.mahasiswaForm.reset();
            this.isSubmitting = false;

            // Tutup modal edit setelah data berhasil diupdate
            const modalElement = document.getElementById(
              'editMahasiswaModal'
            ) as HTMLElement;
            if (modalElement) {
              const modalInstance = bootstrap.Modal.getInstance(modalElement);
              modalInstance?.hide();
            }
          },
          error: (err) => {
            console.error('Error updating mahasiswa:', err);
            this.isSubmitting = false;
          },
        });
    }
  }

  deleteMahasiswa(_id: string): void {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      // Konfirmasi penghapusan
      const token = localStorage.getItem('authToken');
      const headers = { Authorization: `Bearer ${token}` };
      this.http
        .delete(`${this.apiMahasiswaUrl}/${_id}`, { headers })
        .subscribe({
          next: () => {
            console.log(`Mahasiswa dengan ID ${_id} berhasil dihapus`);
            this.getMahasiswa(); // Refresh data Mahasiswa setelah penghapusan
          },
          error: (err) => {
            console.error('Error menghapus mahasiwa:', err); // Log error jika penghapusan gagal
          },
        });
    }
  }
}
