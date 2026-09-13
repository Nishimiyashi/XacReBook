import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <>
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
        <p className="font-display text-6xl font-bold text-accent">404</p>
        <p className="mt-3 text-muted">Энэ хуудас олдсонгүй.</p>
        <Link to="/" className="mt-6 font-semibold text-accent hover:underline">
          Нүүр хуудас руу буцах
        </Link>
      </div>
      <Footer />
    </>
  );
}
