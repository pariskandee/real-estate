import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);

  return (
    <div className="login-page">
      <h2>Login to Your Account</h2>
      <button onClick={login}>Login with Google</button>
    </div>
  );
};

export default Login;
