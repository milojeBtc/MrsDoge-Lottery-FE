import { BrowserRouter, Route, Routes } from 'react-router-dom';
// import Contact from './Pages/Contact';
// import About from './Pages/About';
import Home from './Pages/Home';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
