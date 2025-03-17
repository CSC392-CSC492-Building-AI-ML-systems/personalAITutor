export async function register(name: string, email: string, password: string) {
  try {
    const response = await fetch("http://localhost:7000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to register:", error);
  }
}

export async function login(email: string, password: string) {
  try {
    const response = await fetch("http://localhost:7000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    localStorage.setItem("authToken", data.token); // Store the token
    return data;
  } catch (error) {
    console.error("Failed to login:", error);
  }
}

export async function logout() {
  try {
    const response = await fetch("http://localhost:7000/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    localStorage.removeItem("authToken"); // Unset the token
  } catch (error) {
    console.error("Failed to logout:", error);
  }
}

export async function deleteQuestions(courseName: string) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found");
  }

  try {
    const response = await fetch(`http://localhost:7000/auth/delete-questions/${courseName}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to delete questions:", error);
  }
}

export async function deleteUser() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found");
  }

  try {
    const response = await fetch("http://localhost:7000/auth/delete-user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to delete user:", error);
  }
}