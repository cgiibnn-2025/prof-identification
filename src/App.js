import React, { useState } from 'react';
import './App.css';
import SplashScreen from './components/SplashScreen';
import ProfessorRegistrationForm from './components/ProfessorRegistrationForm';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="App">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <ProfessorRegistrationForm />
    </div>
  );
}

export default App;
