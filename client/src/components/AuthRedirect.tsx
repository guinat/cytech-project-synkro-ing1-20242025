import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface AuthRedirectProps {
    children: React.ReactNode;
    title: string;
}

const AuthRedirect: React.FC<AuthRedirectProps> = ({ children, title }) => {
    const { isAuthenticated, logout } = useAuth();
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            setDialogOpen(true);
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        setDialogOpen(false);
    };

    const handleGoToDebug = () => {
        setDialogOpen(false);
        navigate('/debug');
    };

    if (!isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Already Logged In</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>You are already logged in. If you wish to {title.toLowerCase()} with another account, please log out first.</p>
                    </div>
                    <DialogFooter className="flex gap-2 sm:justify-between">
                        <Button variant="outline" onClick={handleGoToDebug}>
                            Go to Debug
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            Log Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="min-h-screen bg-gray-50"></div>
        </>
    );
};

export default AuthRedirect;