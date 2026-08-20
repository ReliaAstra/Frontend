import { Metadata } from 'next';
import { ContactContent } from './contact-content';

export const metadata: Metadata = {
  title: 'Contact | Reliastra',
  description: 'Get in touch with the Reliastra team. We reply within 4 hours.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <ContactContent />
    </main>
  );
}
