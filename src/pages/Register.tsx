import { Navigate } from "react-router-dom";

// Registration is no longer needed — login handles everything with magic link
const Register = () => {
  return <Navigate to="/login" replace />;
};

export default Register;
