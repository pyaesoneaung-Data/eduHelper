import { useState } from "react";
import api from "../api/api";
import "../App.css";

function Home() {
  const [recommendations, setRecommendations] = useState([]);

  const [formData, setFormData] = useState({
    country_id: "",
    degree_level: "",
    instruction_language: "",
    max_budget: "",
    user_gpa: "",
    user_ielts: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRecommend = async () => {
    try {
      const response = await api.get("/recommend/programs", {
        params: {
          country_id: formData.country_id || undefined,
          degree_level: formData.degree_level || undefined,
          instruction_language: formData.instruction_language || undefined,
          max_budget: formData.max_budget || undefined,
          user_gpa: formData.user_gpa || undefined,
          user_ielts: formData.user_ielts || undefined,
        },
      });

      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 120) return "score high";
    if (score >= 80) return "score medium";
    return "score low";
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">EduCompare</h1>
        <p className="subtitle">
          Compare university programs with real data, not advertising.
        </p>

        <div className="form-card">
          <h2>Recommendation Form</h2>

          <div className="form-section">
            <h3>Study Preferences</h3>

            <label>Country</label>
            <select
              name="country_id"
              value={formData.country_id}
              onChange={handleChange}
            >
              <option value="">Select Country</option>
              <option value="C001">Taiwan</option>
              <option value="C002">Thailand</option>
            </select>

            <label>Degree Level</label>
            <select
              name="degree_level"
              value={formData.degree_level}
              onChange={handleChange}
            >
              <option value="">Select Degree</option>
              <option value="Bachelor">Bachelor</option>
            </select>

            <label>Instruction Language</label>
            <select
              name="instruction_language"
              value={formData.instruction_language}
              onChange={handleChange}
            >
              <option value="">Select Language</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className="form-section">
            <h3>Budget</h3>
            <label>Max Yearly Budget</label>
            <input
              type="number"
              name="max_budget"
              placeholder="Enter budget"
              value={formData.max_budget}
              onChange={handleChange}
            />
          </div>

          <div className="form-section">
            <h3>Academic Profile</h3>

            <label>Your GPA</label>
            <input
              type="number"
              step="0.01"
              name="user_gpa"
              placeholder="Enter GPA"
              value={formData.user_gpa}
              onChange={handleChange}
            />

            <label>Your IELTS</label>
            <input
              type="number"
              step="0.5"
              name="user_ielts"
              placeholder="Enter IELTS"
              value={formData.user_ielts}
              onChange={handleChange}
            />
          </div>

          <button className="recommend-btn" onClick={handleRecommend}>
            Get Recommendations
          </button>
        </div>

        <div className="results-section">
          <h2>Results</h2>

          {recommendations.length === 0 ? (
            <p className="empty-text">No recommendations yet.</p>
          ) : (
            <div className="results-grid">
              {recommendations.map((item) => (
                <div className="result-card" key={item.program_id}>
                  <h3>{item.major_name}</h3>
                  <p className="university-name">{item.university_name}</p>

                  <p><strong>Country:</strong> {item.country_id}</p>
                  <p><strong>Degree:</strong> {item.degree_level}</p>
                  <p><strong>Language:</strong> {item.instruction_language}</p>
                  <p><strong>Yearly Cost:</strong> {item.estimated_yearly_cost} {item.currency}</p>

                  <div className={getScoreClass(item.score)}>
                    Score: {item.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;