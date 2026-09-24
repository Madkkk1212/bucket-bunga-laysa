import { Flower, Share2, Heart, Globe, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <Flower size={22} className="logo-icon" />
            <span>BucketBunga</span>
          </div>
        <p className="footer-tagline">
          Thoughtfully designed flowers and gifts that celebrate life&apos;s nature and every meaningful
          moment.
        </p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram" className="social-icon"><Heart size={18} /></a>
            <a href="#" aria-label="Twitter" className="social-icon"><Globe size={18} /></a>
            <a href="#" aria-label="Share" className="social-icon"><Share2 size={18} /></a>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Quick Links</h4>
          <ul>
            {['Flowers', 'Shop', 'Occasions', 'Corporate', 'About Us', 'Blog'].map((l) => (
              <li key={l}><Link href="#">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-links-col">
          <h4>Customer Care</h4>
          <ul>
            {['FAQ', 'Shipping Policy', 'Return Policy', 'Privacy Policy', 'Terms of Service'].map(
              (l) => (
                <li key={l}><Link href="#">{l}</Link></li>
              ),
            )}
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <div className="contact-item">
            <Mail size={15} />
            <span>hello@bucketbunga.com</span>
          </div>
          <div className="contact-item">
            <Phone size={15} />
            <span>+62 812-3456-7890</span>
          </div>
          <div className="contact-item">
            <MapPin size={15} />
            <span>Jakarta, Indonesia</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BucketBunga. All rights reserved.</p>
        <p>Made with 🌸 for flower lovers</p>
      </div>
    </footer>
  );
}
