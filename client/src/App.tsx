import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';

import HelloWorld from './components/HelloWorld';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HelloWorld />} />
        <Route path="/page1" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
      </Routes>
    </Router>
  );
};

export default App;
