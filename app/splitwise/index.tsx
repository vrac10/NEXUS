import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image,Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
const { width: screenWidth } = Dimensions.get('window');
// Example component to represent your screen
const SplitScreen = () => {
  return (
    <View style={styles.container}>
      {/* Top logo area */}
      <View style={styles.logoContainer}>
        {/* Replace the source with your logo asset or URI */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
        />
      </View>

      {/* Create Group button as a + symbol in the top right */}
      <TouchableOpacity style={styles.createGroupButton}>
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Owe information */}
      <Text style={styles.overallText}>Overall, you owe XXXX</Text>

      {/* Individual friend/group owe details */}
      <View style={styles.oweItem}>
      <TouchableOpacity>
        <Text style={styles.oweTitle}>Friend 1</Text>
        <Text style={styles.oweAmount}>you owe XXXX</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.oweItem} >
      <TouchableOpacity onPress={() => router.push({pathname: './splitwise/group', params: { group: 'Group 1' }})}>
        <Text style={styles.oweTitle}>Group 1</Text>
        <Text style={styles.oweAmount}>you owe XXXX</Text>
    </TouchableOpacity>
      </View>

      {/* Settled-up activities button */}
      <View style={styles.settledContainer}>
        <TouchableOpacity style={styles.settledButton}>
          <Text style={styles.settledButtonText}>Show settled-up activities</Text>
        </TouchableOpacity>
      </View>

      {/* Add Expense button */}
      <View style={styles.addExpenseContainer}>
        <TouchableOpacity style={styles.addExpenseButton}>
          <Text style={styles.addExpenseButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom navigation bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home" size={24} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <View style={styles.qrButtonWrapper}>
          <View style={styles.qrButtonContainer}>
            <TouchableOpacity style={styles.qrButton}>
              <Ionicons name="qr-code" size={34} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="wallet" size={24} color="white" />
          <Text style={styles.navText}>Budget</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SplitScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // black background
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  logoContainer: {
    position: "absolute",
    top: 50, // Adjust top spacing
    left: -15, // Align to left
  },
  logo: {
    width: 120, // Adjust size
    height: 65,
  },
  createGroupButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#5c2f92', // your preferred purple
    padding: 10,
    borderRadius: 50,
  },
  overallText: {
    color: '#fff',
    fontSize: 18,
    marginVertical: 100,
    textAlign: 'center',
    marginBottom: 100,
  },
  oweItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  oweTitle: {
    color: '#fff',
    fontSize: 16,
  },
  oweAmount: {
    color: '#fff',
    fontSize: 16,
  },
  settledContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    position: 'center',
  },
  settledButton: {
    backgroundColor: '#5c2f92',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 15,
    },
  settledButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 14,
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

});
