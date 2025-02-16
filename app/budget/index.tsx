import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Text, ActivityIndicator } from 'react-native';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import { UserProvider, useUser } from '../UserContext';
import { router, useSegments } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

const TransactionChartScreen = () => {
    const colors = [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
        '#8E44AD',
        '#27AE60',
        '#E74C3C',
        '#3498DB',
      ];
  const [transactions, setTransactions] = useState([]);
  const [suggestions, setSuggestions] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { userId } = useUser();
  const segments = useSegments();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`https://465a-223-31-218-223.ngrok-free.app/api/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (userId) fetchUserData();
  }, [segments, userId]);

  useEffect(() => {
    // Fetch LLM-based financial insights based on transactions
    const fetchSuggestions = async () => {
      if (transactions.length === 0) return;
      setLoadingSuggestions(true);
      try {
        const response = await fetch('https://465a-223-31-218-223.ngrok-free.app/api/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions }),
        });
        const data = await response.json();
        setSuggestions(data.suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [transactions]);

  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No transactions available</Text>
      </View>
    );
  }

  // Pie Chart: Aggregate by main_category
  const splitTransactions = transactions.map((transaction) => {
    const [main_category] = transaction.category.split(' - ');
    return { ...transaction, main_category };
  });

  const dataByMainCategory = splitTransactions.reduce((acc, curr) => {
    acc[curr.main_category] = (acc[curr.main_category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieChartData = Object.keys(dataByMainCategory).map((key, index) => ({
    name: key,
    amount: dataByMainCategory[key],
    color: colors[index % colors.length],
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  }));

  // Line Chart: Filter to last 3 months and aggregate weekly
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const filteredTransactions = transactions.filter(
    (transaction) => new Date(transaction.date) >= threeMonthsAgo
  );

  const weeklyData = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const weekKey = `${date.getMonth() + 1}/${date.getDate()}`;
    acc[weekKey] = (acc[weekKey] || 0) + transaction.amount;
    return acc;
  }, {});

  const lineChartData = {
    labels: Object.keys(weeklyData).sort(),
    datasets: [{ data: Object.values(weeklyData) }],
  };

  // Merchant Analysis: Find the top 10 merchants
  const merchantFrequency = transactions.reduce((acc, transaction) => {
    acc[transaction.to] = (acc[transaction.to] || 0) + 1;
    return acc;
  }, {});

  const sortedMerchants = Object.entries(merchantFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const merchantChartData = {
    labels: sortedMerchants.map(([merchant]) => merchant),
    datasets: [{ data: sortedMerchants.map(([, count]) => count) }],
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Spending by Category</Text>
        <PieChart
          data={pieChartData}
          width={340}
          height={220}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={styles.chart}
        />

        <Text style={styles.title}>Spending Over Time (Last 3 Months)</Text>
        <LineChart
          data={lineChartData}
          width={340}
          height={220}
          yAxisLabel="$"
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />

        <Text style={styles.title}>Top Merchants</Text>
        <BarChart
          data={merchantChartData}
          width={screenWidth}
          height={260}
          chartConfig={chartConfig}
          style={styles.chart}
        />

        <Text style={styles.title}>Suggestions for You</Text>
        <View style={styles.suggestionBox}>
          {loadingSuggestions ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <Text style={styles.suggestionText}>{suggestions || 'No suggestions available'}</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const chartConfig = {
  backgroundColor: '#1E2923',
  backgroundGradientFrom: '#3F51B5',
  backgroundGradientTo: '#2196F3',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  chart: {
    marginVertical: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  suggestionBox: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 16,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default TransactionChartScreen;
