import { Link } from 'react-router-dom';
import reactsvg from '@/assets/synkro-logo-svg.svg';
import { Button } from '@/components/ui/button';
import MaxWidthWrapper from './MaxWidthWrapper';

const Header = () => {
    return (
        <MaxWidthWrapper className='max-w-screen-2xl'>
            <header className="flex items-center justify-between p-4">
                <Link to="/">
                    <div className="flex items-center">
                        <img
                            src={reactsvg}
                            alt="Logo de l'entreprise"
                            className="h-8 w-8 mr-2"
                        />
                        <span className="font-chakra italic font-bold text-xl">
                            Synkro
                        </span>
                    </div>
                </Link>


                <nav>
                    <ul className="flex items-center space-x-8">
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/page1">Page 1</Link>
                        </li>
                        <li>
                            <Link to="/page2">Page 2</Link>
                        </li>
                    </ul>
                </nav>

                <div>
                    <Link to="#">
                        <Button variant="login" className='hover:cursor-pointer'>Log in</Button>
                    </Link>
                </div>
            </header>
        </MaxWidthWrapper>
    );
};

export default Header;
