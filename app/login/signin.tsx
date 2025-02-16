import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "../UserContext"; // Import the custom hook

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setUserId } = useUser(); // Destructure setUserId from the UserContext

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch("https://465a-223-31-218-223.ngrok-free.app/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the UserContext with the returned user ID
        setUserId(data.userId); // Assuming the response contains a `userId` field

        Alert.alert("Success", "Login successful!");
        router.replace("/Home");
      } else {
        Alert.alert("Error", "Invalid email or password.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred. Please try again later.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOG IN</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("./signup")}>
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#2E2E2E",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
    marginBottom: 15,
  },
  forgotPassword: {
    color: "#aaa",
    fontSize: 14,
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#5A2A90",
    paddingVertical: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  signupText: {
    color: "#aaa",
    fontSize: 14,
  },
  signupLink: {
    color: "#5A2A90",
    fontWeight: "bold",
  },
});

export default Login;
