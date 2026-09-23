import { Suspense } from 'react';
import Image from 'next/image';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Connexion — ECM Manager',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ecm-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo + titre */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/logo-ecm.png"
            alt="ECM"
            width={80}
            height={80}
            className="rounded-lg mb-4"
            priority
          />
          <h1 className="text-2xl font-bold text-ecm-blue">ECM Manager</h1>
          <p className="text-sm text-ecm-orange font-medium mt-1">
            L'expertise fait la différence.
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-ecm-blue mb-1">
            Connexion
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Entrez vos identifiants pour accéder à l'application.
          </p>

          <Suspense fallback={<div className="text-sm text-gray-400">Chargement...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 ECM — Équipe de Construction Moderne
        </p>
      </div>
    </div>
  );
}