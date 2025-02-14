import { useState, useEffect } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import Landing from './pages/Landing';
import Demo from './pages/Demo.tsx';


// Footer Component

// Main App Component
const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const renderContent = () => {
    switch (currentPath) {
      case "/app":
        return <Demo />;
        break;
      default:
        return <Landing />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;