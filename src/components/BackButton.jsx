import { useNavigate } from "react-router-dom";

function BackButton({ fallback = "/" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="back-button"
      aria-label="Go back"
    >
      <span className="back-chevron">&lt;</span>
      <span>Back</span>
    </button>
  );
}

export default BackButton;