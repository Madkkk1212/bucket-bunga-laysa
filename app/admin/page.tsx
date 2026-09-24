import { notFound } from 'next/navigation';

// Halaman /admin telah dipindahkan dan dienkripsi demi keamanan.
// Mengembalikan 404 Not Found secara default.
export default function AdminDeadRoute() {
  notFound();
}
