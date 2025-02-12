import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <nav className="p-4 bg-cyan-100 text-sky-600">
            <ul className="flex space-x-4">
                <li><Link to="/" className="hover:underline">Home</Link></li>
                <li><Link to="/page1" className="hover:underline">Page1</Link></li>
                <li><Link to="/page2" className="hover:underline">Page2</Link></li>
            </ul>
        </nav>
    );
};

export default Header;
