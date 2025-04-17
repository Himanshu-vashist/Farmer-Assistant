import { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [language, setLanguage] = useState('English');
  const [history, setHistory] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [expandedDiagnoses, setExpandedDiagnoses] = useState({}); // Track expanded items

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleClassify = async () => {
    if (!image) {
      setError('Please upload an image.');
      return;
    }
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('image', image);
    formData.append('language', language);

    try {
      const response = await axios.post('http://localhost:8000/classify', formData, {
        responseType: 'json',
        timeout: 30000,
      });
      const { diagnosis, audio } = response.data;
      setDiagnosis(diagnosis);
      setAudioUrl(`data:audio/mp3;base64,${audio}`);
      setHistory([diagnosis, ...history.slice(0, 4)]);
    } catch (err) {
      setError('Error classifying image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setAudioUrl(null);
    setDiagnosis('');
    setExpandedDiagnoses({});
  };

  const toggleExpand = (index) => {
    setExpandedDiagnoses((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">🕓 Past Diagnoses</h2>
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 mb-2 rounded"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
        {showHistory && (
          <div className="mt-4">
            {history.length > 0 ? (
              history.map((item, idx) => (
                <div key={idx} className="mb-4 border-b pb-2">
                  <div className="flex justify-between items-center">
                    <strong>#{idx + 1}:</strong>
                    <button
                      className="text-blue-300 hover:text-blue-400 text-sm"
                      onClick={() => toggleExpand(idx)}
                    >
                      {expandedDiagnoses[idx] ? 'Collapse' : 'Expand'}
                    </button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {expandedDiagnoses[idx] ? item : `${item.substring(0, 100)}...`}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No diagnosis history yet.</p>
            )}
          </div>
        )}
        <button
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
          onClick={handleClearHistory}
        >
          🗑️ Clear History
        </button>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-8">
        <h1 className="text-3xl font-bold mb-6">🌿 Plant Disease Classifier</h1>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block text-lg mb-2">📸 Upload a plant image...</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="mb-4">
            <img src={preview} alt="Uploaded" className="max-w-full h-auto rounded shadow" />
            <p className="text-sm text-gray-600 mt-2">🖼️ Uploaded Image</p>
          </div>
        )}

        {/* Language Selection */}
        <div className="mb-4">
          <label className="block text-lg mb-2">🌐 Diagnosis Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option>English</option>
            <option>Hindi</option>
            <option>Bengali</option>
          </select>
        </div>

        {/* Classify Button */}
        <button
          onClick={handleClassify}
          disabled={loading}
          className={`w-full py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {loading ? 'Classifying...' : '🔍 Classify'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            ❌ {error}
          </div>
        )}

        {/* Diagnosis Output */}
        {diagnosis && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded">
            <h3 className="text-lg font-bold">✅ Diagnosis:</h3>
            <p className="whitespace-pre-wrap">{diagnosis}</p>
          </div>
        )}

        {/* Audio Playback */}
        {audioUrl && (
          <div className="mt-4">
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;