import { useNavigate } from "react-router-dom";

function Return() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} style={{ marginBottom: "10px" }}>
      ← Quay lại
    </button>
  );
}

export default Return;
