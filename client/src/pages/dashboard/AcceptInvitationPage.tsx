import React from 'react';

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useHomes } from '@/contexts/HomesContext';
import { useAuth } from '@/contexts/AuthContext';
import { HomeInvitationAcceptForm } from '@/components/3_home/forms/HomeInvitationAcceptForm';
import { HomeInvitationDeclineForm } from '@/components/3_home/forms/HomeInvitationDeclineForm';

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { acceptInvitationByToken, rejectInvitationByToken } = useHomes();
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  // Décodage du token pour obtenir l'email invité (toujours avant tout return)
  const invitedEmail = React.useMemo(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.email as string;
      } catch {
        return null;
      }
    }
    return null;
  }, [token]);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Aucun token fourni.');
      return;
    }
    // On ne fait plus rien automatiquement ici
  }, [token]);

  // Gestion des actions
  const handleAccept = async () => {
    if (!token) return;
    setStatus('pending');
    setMessage('');
    try {
      await acceptInvitationByToken(token);
      setStatus('success');
      setMessage('Invitation acceptée avec succès !');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || "Erreur lors de l'acceptation de l'invitation.");
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setStatus('pending');
    setMessage('');
    try {
      await rejectInvitationByToken(token);
      setStatus('success');
      setMessage('Invitation déclinée.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || "Erreur lors du refus de l'invitation.");
    }
  };

  if (!user) {
    const nextUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
        <h2>Acceptation d'invitation</h2>
        <p>Veuillez vous connecter avec l'adresse email invitée pour accepter cette invitation.</p>
        <a href={`/auth/sign_in?next=${nextUrl}`}>
          <button style={{ marginTop: 16, padding: '8px 24px', fontSize: 16 }}>Se connecter</button>
        </a>
      </div>
    );
  }

  if (user && user.is_email_verified === false) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
        <h2>Acceptation d'invitation</h2>
        <p style={{ color: 'red' }}>
          Vous devez vérifier votre adresse email avant de pouvoir rejoindre une maison.<br/>
          Consultez vos emails pour valider votre compte.
        </p>
      </div>
    );
  }

  if (user && invitedEmail && user.email !== invitedEmail) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
        <h2>Acceptation d'invitation</h2>
        <p style={{ color: 'red' }}>
          Vous devez être connecté avec l'adresse invitée ({invitedEmail}) pour accepter cette invitation.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
      <h2>Acceptation d'invitation</h2>
      {status === 'pending' && <p>Traitement en cours...</p>}
      {status === 'success' && (
        <>
          <p style={{ color: 'green' }}>{message}</p>
          <button onClick={() => navigate('/dashboard')} style={{ marginTop: 16, padding: '8px 24px', fontSize: 16 }}>
            Aller au dashboard
          </button>
        </>
      )}
      {status === 'error' && <p style={{ color: 'red' }}>{message}</p>}
      {status === 'idle' && user && invitedEmail && user.email === invitedEmail && (
        <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center' }}>
          <HomeInvitationAcceptForm
            onSubmit={handleAccept}
            loading={false}
            error={undefined}
            label="Accepter l'invitation"
            className="w-auto"
          />
          <HomeInvitationDeclineForm
            onSubmit={handleDecline}
            loading={false}
            error={undefined}
            label="Décliner l'invitation"
            className="w-auto"
          />
        </div>
      )}
    </div>
  );
}
