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
      setMessage('No token provided.');
      return;
    }
  }, [token]);

  // Gestion des actions
  const handleAccept = async () => {
    if (!token) return;
    setStatus('pending');
    setMessage('');
    try {
      await acceptInvitationByToken(token);
      setStatus('success');
      setMessage('Invitation accepted successfully!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || "Error accepting invitation.");
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    setStatus('pending');
    setMessage('');
    try {
      await rejectInvitationByToken(token);
      setStatus('success');
      setMessage('Invitation declined successfully.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || "Error declining invitation.");
    }
  };

  if (!user) {
    const nextUrl = encodeURIComponent(location.pathname + location.search);
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
        <h2>Invitation Acceptance</h2>
        <p>Please connect with the invited email address to accept this invitation.</p>
        <a href={`/auth/sign_in?next=${nextUrl}`}>
          <button style={{ marginTop: 16, padding: '8px 24px', fontSize: 16 }}>Connect</button>
        </a>
      </div>
    );
  }

  if (user && user.is_email_verified === false) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
        <h2>Invitation Acceptance</h2>
        <p style={{ color: 'red' }}>
          You must verify your email address before joining a house.<br/>
          Check your emails to validate your account.
        </p>
      </div>
    );
  }

  if (user && invitedEmail && user.email !== invitedEmail) {
    return (
      <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
        <h2>Invitation Acceptance</h2>
        <p style={{ color: 'red' }}>
          You must be connected with the invited email address ({invitedEmail}) to accept this invitation.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center' }}>
      <h2>Invitation Acceptance</h2>
      {status === 'pending' && <p>Processing...</p>}
      {status === 'success' && (
        <>
          <p style={{ color: 'green' }}>{message}</p>
          <button onClick={() => navigate('/dashboard')} style={{ marginTop: 16, padding: '8px 24px', fontSize: 16 }}>
            Go to dashboard
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
            label="Accept Invitation"
            className="w-auto"
          />
          <HomeInvitationDeclineForm
            onSubmit={handleDecline}
            loading={false}
            error={undefined}
            label="Decline Invitation"
            className="w-auto"
          />
        </div>
      )}
    </div>
  );
}
