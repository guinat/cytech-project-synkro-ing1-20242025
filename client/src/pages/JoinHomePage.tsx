import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Home, AlertCircle, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper";
import homeService from "@/services/home.service";
import { toast } from "sonner";

const JoinHomePage = () => {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [homeDetails, setHomeDetails] = useState<{ name: string; owner_username: string } | null>(null);
  
  // Function to join the home
  const joinHome = async () => {
    if (!token) {
      setJoinStatus('error');
      setErrorMessage("Missing invitation token");
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await homeService.joinByToken(token);
      
      if (response.status === 'success' && response.data) {
        setHomeDetails({
          name: response.data.name,
          owner_username: response.data.owner_username || 'the owner'
        });
        setJoinStatus('success');
        toast.success(`You have successfully joined the home!`);
      } else {
        setJoinStatus('error');
        setErrorMessage(response.message || "An error occurred while accepting the invitation");
      }
    } catch (error: any) {
      setJoinStatus('error');
      setErrorMessage(
        error.response?.data?.message || 
        "An error occurred while accepting the invitation. The invitation may be expired or has already been used."
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  useEffect(() => {
    // If the user is authenticated, we try to join the home automatically
    if (isAuthenticated && token) {
      joinHome();
    }
  }, [isAuthenticated, token]);
  
  return (
    <MaxWidthWrapper className="flex items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Home className="h-6 w-6" />
            Home Invitation
          </CardTitle>
          <CardDescription>
            Join a Synkro connected home
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!isAuthenticated ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Required</AlertTitle>
              <AlertDescription>
                You must be logged in to join this home.
                {!user && (
                  <div className="mt-2">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-primary"
                      onClick={() => navigate(`/login?redirect=/join-home/${token}`)}
                    >
                      Log in
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ) : isProcessing ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-center text-muted-foreground">
                Processing your invitation...
              </p>
            </div>
          ) : joinStatus === 'success' ? (
            <div className="py-4">
              <div className="flex flex-col items-center justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-medium text-center">
                  You have successfully joined the home!
                </h3>
                <p className="text-center text-muted-foreground mt-2">
                  Welcome to the home <span className="font-medium">{homeDetails?.name}</span> of <span className="font-medium">{homeDetails?.owner_username}</span>.
                </p>
              </div>
            </div>
          ) : joinStatus === 'error' ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage || "An error occurred while accepting the invitation."}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {isAuthenticated && !isProcessing && (
            joinStatus === 'idle' ? (
              <Button 
                onClick={joinHome} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Join home
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/dashboard/homes')}
                className="w-full"
              >
                Go to my homes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )
          )}
          
          {!isAuthenticated && (
            <Button 
              onClick={() => navigate(`/login?redirect=/join-home/${token}`)}
              className="w-full"
            >
              Log in to join
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </MaxWidthWrapper>
  );
};

export default JoinHomePage; 