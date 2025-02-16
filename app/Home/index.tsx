import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions, ActivityIndicator, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProvider, useUser } from '../UserContext';
import { router, useSegments } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const transactions = [
  { id: '1', description: 'Grocery Shopping', amount: '-$50', date: 'Feb 14, 2025' },
  { id: '2', description: 'Salary', amount: '+$2000', date: 'Feb 13, 2025' },
  { id: '3', description: 'Electricity Bill', amount: '-$100', date: 'Feb 12, 2025' },
];

const BankingApp = () => {
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]); // Use state for transactions
  const [loadingTransactions, setLoadingTransactions] = useState(false); 
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState(null);
  const { userId } = useUser();
  const segments = useSegments();

  console.log(userId)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://465a-223-31-218-223.ngrok-free.app/api/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data.user_details);
        console.log(data)
        setQrUrl(data.file);
        setTransactions(data.transactions)
        console.log(data.transactions)
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [segments, userId]);

  const fetchTransactions = async () => {
    setLoadingTransactions(true); // Show loading indicator for transactions
    try {
      const response = await fetch(`https://465a-223-31-218-223.ngrok-free.app/api/transactions/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data.transactions); // Assuming the backend returns { transactions: [...] }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoadingTransactions(false); // Hide loading indicator
    }
  };


  const toggleQRCode = async () => {
    if (showQRCode) {
      setShowQRCode(false); // Hide QR code
      return;
    }

    try {
      const response = await fetch(`https://c6ae-223-31-218-223.ngrok-free.app/api/qr_image/${qrUrl}`);
    if (!response.ok) throw new Error('Failed to generate QR code');
    const data = await response.json(); // Expecting { imageUrl: "https://..." }
    setQrCodeImage(data.imageUrl); // Set the image URL

    setShowQRCode(true);

    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load user data</Text>
      </View>
    );
  }

  return (
    <UserProvider>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
        </View>

        {/* Toggleable Account/QR Code Card */}
        <TouchableOpacity style={styles.accountCard} onPress={toggleQRCode}>
          {showQRCode ? (
            
            <ImageBackground
            
              source={require("../assets/qr_code_67b0dc57b4e717755fbb8582.png")}
              style={styles.qrCode}
              resizeMode="contain"
            />
          ) : (
            <>
              <Text style={styles.accountTitle}>Savings Account</Text>
              <Text style={styles.accountNumber}>{userData.name}</Text>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balance}>₹{userData.amount || 0}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Budget Section */}
        <View style={styles.budgetContainer}>
          <View style={styles.budgetColumn}>
            <Text style={styles.budgetLabel}>Set Budget</Text>
            <Text style={styles.budgetValue}>₹2000</Text>
          </View>
          <View style={styles.budgetColumn}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={styles.budgetValue}>₹1500</Text>
          </View>
        </View>

        {/* Collapsible Recent Transactions */}
        <TouchableOpacity onPress={() => {setShowTransactions(!showTransactions)
          if (!showTransactions) fetchTransactions();
        }}>
          <Text style={styles.transactionsTitle}>
            {showTransactions ? 'Hide Recent Transactions' : 'Show Recent Transactions'}
          </Text>
        </TouchableOpacity>
        {showTransactions && (
          <View style={styles.transactionsContainer}>
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.index}
              renderItem={({ item }) => (
                <View style={styles.transactionItem}>
                  <Text style={styles.transactionDescription}>{item.category}</Text>
                  <Text style={styles.transactionAmount}>₹{item.amount}</Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
              )}
            />
          </View>
        )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navButton} onPress={() => {
            console.log("heelos")
            router.push('./splitwise')
            }}>

            <Ionicons name="home" size={24} color="white" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <View style={styles.qrButtonWrapper}>
            <View style={styles.qrButtonContainer}>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() => router.push({ pathname: './scanner', params: { name: userData.name } })}
              >
                <Ionicons name="qr-code" size={34} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push({ pathname: './budget'})}>
            <Ionicons name="wallet" size={24} color="white" />
            <Text style={styles.navText}>Budget</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.addExpenseContainer}>
              <TouchableOpacity style={styles.addExpenseButton} onPress={() => {
            console.log("heelos")
            router.push('./splitwise')
            }}>
                <Text style={styles.addExpenseButtonText}>Splitwise</Text>
              </TouchableOpacity>
            </View>
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    paddingTop: 50,
  },
  logoContainer: {
    position: "absolute",
    top: 50, // Adjust top spacing
    left: 15, // Align to left
  },
  logo: {
    width: 120, // Adjust size
    height: 65,
  },
  accountCard: {
    backgroundColor: '#3D1B67',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 75, // Added marginTop to avoid overlap with logo
  },
  accountTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  accountNumber: {
    color: 'lightgray',
    fontSize: 12,
    marginBottom: 10,
  },
  balanceLabel: {
    color: 'white',
    fontSize: 14,
  },
  balance: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  overdueLimit: {
    color: 'lightgray',
    fontSize: 12,
    marginTop: 5,
  },
  budgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  budgetColumn: {
    alignItems: 'center',
  },
  budgetLabel: {
    color: 'white',
    fontSize: 14,
  },
  budgetValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionsContainer: {
    width: '80%',
    marginTop: 20,
  },
  transactionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  transactionItem: {
    backgroundColor: '#2C2C2C',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  transactionDescription: {
    color: 'white',
    fontSize: 14,
  },
  transactionAmount: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    color: 'lightgray',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#3D1B67',
    position: 'absolute',
    bottom: 0,
    marginRight: 30,
    paddingVertical: 20,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
  },
  qrButtonWrapper: {
    position: 'absolute',
    bottom: 5, // Adjust this value to move the button up
    width: screenWidth / 2+30, // Set width to half of the screen width
    height: 85,
    overflow: 'hidden',
    alignItems: 'center',
  },
  qrButtonContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3D1B67',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButton: {
    width: 70,
    height: 70,
    borderRadius: 60,
    backgroundColor: '#5A2D82',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
  qrCode: {
    width: '100%',
    height: 150,
  },
  addExpenseContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
  },
  addExpenseButton: {
    backgroundColor: '#5c2f92', // your preferred purple
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addExpenseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default BankingApp;