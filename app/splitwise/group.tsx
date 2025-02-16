import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ExpenseSplitScreen = () => {
  const [splitOption, setSplitOption] = useState('equally');
  const [participants, setParticipants] = useState([{ name: '', amount: '' }]);

  // Add a new participant input field
  const addParticipant = () => {
    setParticipants([...participants, { name: '', amount: '' }]);
  };

  // Update participant data
  const updateParticipant = (index, field, value) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index][field] = value;
    setParticipants(updatedParticipants);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Split By</Text>
      <Picker
        selectedValue={splitOption}
        onValueChange={(value) => setSplitOption(value)}
        style={styles.picker}
      >
        <Picker.Item label="Equally" value="equally" />
        <Picker.Item label="Unequally" value="unequally" />
      </Picker>

      {/* Conditionally render form based on split option */}
      <View style={styles.participantContainer}>
        <Text style={styles.label}>
          {splitOption === 'equally'
            ? 'Enter participant names:'
            : 'Enter participant names and amounts:'}
        </Text>
        {participants.map((participant, index) => (
          <View key={index} style={styles.inputRow}>
            <TextInput
              placeholder="Name"
              value={participant.name}
              onChangeText={(text) => updateParticipant(index, 'name', text)}
              style={styles.input}
            />
            {splitOption === 'unequally' && (
              <TextInput
                placeholder="Amount"
                value={participant.amount}
                onChangeText={(text) =>
                  updateParticipant(index, 'amount', text)
                }
                keyboardType="numeric"
                style={styles.input}
              />
            )}
          </View>
        ))}
        <Button title="Add Participant" onPress={addParticipant} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    marginBottom: 20,
    marginTop: 20,
  },
  participantContainer: {
    marginTop: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
});

export default ExpenseSplitScreen;