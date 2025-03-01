import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import reactsvg from "@/assets/synkro-logo-svg.svg";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { useAuth } from "../context/AuthContext";

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <MaxWidthWrapper className="max-w-screen-2xl">
            <header className="flex items-center justify-between py-4 px-4 md:px-8">
                <Link to="/" className="flex items-center">
                    <img src={reactsvg} alt="Logo de l'entreprise" className="h-8 w-8 mr-2" />
                    <span className="font-chakra italic font-bold text-xl relative top-[-3px]">
                        Synkro
                    </span>
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
                    <Link to="#" className="hover:text-gray-600">News</Link>
                    <Link to="#" className="hover:text-gray-600">About</Link>
                    <Link to="#" className="hover:text-gray-600">Contact</Link>
                    {isAuthenticated && (
                        <Link to="/debug" className="text-red-500 hover:text-red-600">Debug</Link>
                    )}
                </nav>

                <div className="hidden md:flex items-center space-x-4">
                    {isAuthenticated ? (
                        <>
                            <span className="text-gray-700">
                                Hello, {user?.first_name || user?.username}
                            </span>

                            <Button
                                variant="login"
                                onClick={logout}
                            >
                                <LogOut size={16} />
                                <span>Log out</span>
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="login" className="hover:cursor-pointer">Log in</Button>
                            </Link>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                    {menuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </header>

            <div className={`md:hidden flex flex-col items-center bg-white py-4 transition-all duration-300 ${menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}>
                <Link to="#" className="py-2 hover:text-gray-600" onClick={() => setMenuOpen(false)}>News</Link>
                <Link to="#" className="py-2 hover:text-gray-600" onClick={() => setMenuOpen(false)}>About</Link>
                <Link to="#" className="py-2 hover:text-gray-600" onClick={() => setMenuOpen(false)}>Contact</Link>

                {isAuthenticated && (
                    <Link to="/debug" className="py-2 text-red-500 hover:text-red-600" onClick={() => setMenuOpen(false)}>Debug</Link>
                )}

                {isAuthenticated ? (
                    <>
                        <div className="my-2 text-gray-700">
                            Hello, {user?.first_name || user?.username}
                        </div>

                        <Button
                            variant="login"
                            onClick={() => {
                                logout();
                                setMenuOpen(false);
                            }}
                        >
                            <LogOut size={16} />
                            <span>Log out</span>
                        </Button>
                    </>
                ) : (
                    <Link to="/login" className="mt-4" onClick={() => setMenuOpen(false)}>
                        <Button variant="login" className="w-full">Log in</Button>
                    </Link>
                )}
            </div>
        </MaxWidthWrapper>
    );
};

export default Header;