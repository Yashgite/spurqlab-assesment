import { Routes, Route } from 'react-router-dom';
import CandidateForm from './pages/CandidateForm';
import VideoInstructions from './pages/VideoInstructions';
import ReviewPage from './pages/ReviewPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CandidateForm />} />
      <Route path="/video" element={<VideoInstructions />} />
      <Route path="/review" element={<ReviewPage />} />
    </Routes>
  );
}

export default App;
