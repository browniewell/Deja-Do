import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import TodoListItem from './components/todoListItem';
import ActionButton from 'react-native-action-button';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

const App = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');

  const [todos, setTodos] = useState([
    new TodoItem(
      'e6552993-ef34-46e6-8b20-1690e90d9fa1',
      'First Item',
      new Date(2022, 3, 15),
      30,
    ),
    new TodoItem(
      '570796d7-4269-43e0-87e0-7dc37eb45e44',
      'Second Item',
      new Date(2022, 3, 5),
      10,
    ),
    new TodoItem(
      '55c893cf-6fe6-4323-8d25-fe4c9f6ce88d',
      'Third Item',
      new Date(2022, 3, 9),
      5,
    ),
    new TodoItem(
      '557b2320-63e1-45a8-ad06-2e6dc70a0fb3',
      'Fourth Item',
      new Date(2022, 3, 2),
      4,
    ),
  ]);

  const [title, setTitle] = useState('');
  const titleChangeHandler = val => {
    setTitle(val);
  };

  const [dueDate, setDueDate] = useState('');
  const dueDateChangeHandler = val => {
    setDueDate(val);
  };

  const [duration, setDuration] = useState('');
  const duartionChangeHandler = val => {
    setDuration(val);
  };

  const addNewItem = () => {
    const uuid = uuidv4();
    setTodos(prevTodos => {
      return [
        ...prevTodos,
        new TodoItem(uuid, title, new Date(dueDate), duration),
      ];
    });
    setCreateModalOpen(false);
  };

  const deleteItem = key => {
    setTodos(prevTodos => {
      return prevTodos.filter(todo => todo.key != key);
    });
    setEditModalOpen(false);
  };

  const renewItem = item => {
    console.log(`RENEW ${item.title}`);
    item.dueDate = new Date().addDays(item.duration);
    setRefresh(!refresh);
  };

  const editItem = item => {
    console.log(`EDIT ${item.title}`);
    setSelectedItem(item.key);
    setEditModalOpen(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Recurrence</Text>

      <Modal visible={editModalOpen} animationType="slide">
        <SafeAreaView style={{flex: 1}}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextInput
              style={styles.inputField}
              placeholder="Title"
              onChangeText={titleChangeHandler}
              returnKeyType="done"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Due Date"
              onChangeText={dueDateChangeHandler}
              returnKeyType="done"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Duration"
              onChangeText={duartionChangeHandler}
              returnKeyType="done"
            />
            <View style={{marginTop: 20}}>
              <Button title="Save" onPress={addNewItem} />
              <Button title="Cancel" onPress={() => setEditModalOpen(false)} />
              <Button
                title="Delete"
                color="red"
                onPress={() => deleteItem(selectedItem)}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={createModalOpen} animationType="slide">
        <SafeAreaView style={{flex: 1}}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TextInput
              style={styles.inputField}
              placeholder="Title"
              onChangeText={titleChangeHandler}
              returnKeyType="done"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Due Date"
              onChangeText={dueDateChangeHandler}
              returnKeyType="done"
            />
            <TextInput
              style={styles.inputField}
              placeholder="Duration"
              onChangeText={duartionChangeHandler}
              returnKeyType="done"
            />
            <View style={{marginTop: 20}}>
              <Button title="Add" onPress={addNewItem} />
              <Button
                title="Cancel"
                onPress={() => setCreateModalOpen(false)}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <FlatList
        data={todos}
        renderItem={({item}) => (
          <TodoListItem
            item={item}
            updateItem={renewItem}
            editItem={editItem}
          />
        )}
        extraData={refresh}
      />

      <ActionButton
        buttonColor="rgba(231,76,60,1)"
        onPress={() => setCreateModalOpen(true)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 30,
    textAlign: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  inputField: {
    marginVertical: 10,
  },
});

export default App;

class TodoItem {
  constructor(key, title, dueDate, duration) {
    this.key = key;
    this.title = title;
    this.duration = duration;
    this.dueDate = dueDate;
    this.daysRemaining = null;
  }

  getProgress() {
    function treatAsUTC(date) {
      var result = new Date(date);
      result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
      return result;
    }

    function daysBetween(start, end) {
      var millisecondsPerDay = 24 * 60 * 60 * 1000;
      var daysBetween =
        (treatAsUTC(end) - treatAsUTC(start)) / millisecondsPerDay;
      return daysBetween;
    }

    // FIXME: If the due date is farther out than the current date plus the duration, the progress bar will be empty until that is no longer the case. This is only applicable on the first occurrence.
    this.daysRemaining = daysBetween(Date.now(), this.dueDate);
    var progress = (this.duration - this.daysRemaining) / this.duration;

    this.daysRemaining = Math.ceil(this.daysRemaining);

    return progress;
  }
}

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};
