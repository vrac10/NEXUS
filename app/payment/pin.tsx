import React, { useState, useRef } from "react";
import { router, Router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";

export default function PinPage() {
  const { fromUser, toUser, amount } = useLocalSearchParams();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Only allow numbers

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < pin.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, key) => {
    if (key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const enteredPin = pin.join("");
    if (enteredPin.length === 4) {
      setLoading(true); // Start loading
      try {
        const response = await fetch("https://465a-223-31-218-223.ngrok-free.app/api/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromUserId: fromUser,
            toUserId: toUser,
            amount: parseFloat(String(amount)),
            pin: enteredPin,
          }),
        });

        const result = await response.json();
        if (response.ok) {
            router.replace('/Home')
          Alert.alert("Payment Successful", "Your payment has been processed successfully.");
        } else {
          Alert.alert("Payment Failed", result.error || "An error occurred during payment.");
        }
      } catch (error) {
        Alert.alert("An error occurred during payment");
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      alert("Please enter a 4-digit PIN.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.heading}>Enter Your PIN</Text>
        <View style={styles.inputContainer}>
          {pin.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              style={styles.input}
              keyboardType="numeric"
              maxLength={1}
              value={digit}
              onChangeText={(value) => handleChange(index, value)}
              onKeyPress={({ nativeEvent }) => handleKeyDown(index, nativeEvent.key)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.goStyle}>GO</Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Processing your payment...</Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 22,
    borderWidth: 1,
    borderColor: "#A0A0A0",
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
  submitButton: {
    position: "absolute",
    bottom: 65,
    right: 45,
    width: 70,
    height: 70,
    backgroundColor: "#8A2BE2",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    color: "#fff"
  },
  goStyle: {
    color: "#fff",
    fontSize: 24,
  },
  loadingContainer: {
    position: "absolute",
    top: "50%",
    left: "40%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFFDD",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
  },
});
