import API from "../services/api";

export default function Register() {
  const register = async () => {
    await API.post("/auth/register", {
      name: "User",
      email: "user@test.com",
      password: "123456"
    });
  };

  return <button onClick={register}>Register</button>;
}
