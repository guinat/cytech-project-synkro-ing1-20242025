import HelloWorld from './components/HelloWorld';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <HelloWorld />
      <p className='text-amber-600'>Hello 2!</p>
    </div>
  );
};

export default App;
