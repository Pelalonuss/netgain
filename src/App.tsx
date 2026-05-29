import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { Workout } from './pages/Workout';
import { Statistics } from './pages/Statistics';
import { Settings } from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen bg-black overflow-x-hidden">
        {/* Cyberpunk Scanlines */}
        <div className="scanlines" />
        <div className="scan-beam" />

        {/* Scrollable Content */}
        <main className="pb-24 min-h-screen overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/workout"  element={<Workout />} />
            <Route path="/stats"    element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
