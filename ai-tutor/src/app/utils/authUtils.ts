

export async function register(username: string, email: string, password: string) {
  try {
    const response = await fetch("http://localhost:7001/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    // Check for 500-level errors and assume it's due to existing email
    if (response.status >= 500) {
      throw new Error("An account with this email already exists");
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Registration failed with status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to register:", error);
    throw error;
  }
}

export async function login(email: string, password: string) {
  try {
    const response = await fetch("http://localhost:7001/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.status === 401) {
      throw new Error(data.message || "Invalid credentials");
    }

    if (!response.ok) {
      throw new Error(
        data.message || `Login failed with status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("Failed to login:", error);
    throw error; // Re-throw to allow handling in the calling component
  }
}

export async function logout() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch("http://localhost:7001/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Logout failed with status: ${response.status}`
      );
    }
  } catch (error) {
    console.error("Failed to logout:", error);
    throw error;
  }
}

export async function deleteQuestions(courseName: string) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found");
  }

  try {
    const response = await fetch(
      `http://localhost:7001/auth/delete-questions/${courseName}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Delete questions failed with status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to delete questions:", error);
    throw error;
  }
}

export async function deleteUser() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No auth token found");
  }

  try {
    const response = await fetch("http://localhost:7001/auth/delete-user", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Delete user failed with status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
}