import React, {useRef, useEffect, useState} from 'react';
import {
  AppState,
  Button,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-date-picker';

const App = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [dueDate, setDueDate] = useState(new Date());
  const [interval, setInterval] = useState('');

  // Refresh stuff
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [refreshing, setRefreshing] = React.useState(false);

  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  const onRefresh = React.useCallback(() => {
    console.log('Refreshing');
    setRefreshing(true);
    setRefresh(!refresh);
    wait(1000).then(() => setRefreshing(false));
  }, []);

  // Refresh when the app becomes active from being in the background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
        setRefresh(!refresh);
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const titleChangeHandler = val => {
    setTitle(val);
  };

  const dueDateChangeHandler = val => {
    setDueDate(new Date(val));
  };

  const duartionChangeHandler = val => {
    setInterval(Number(val));
  };

  const storeData = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('todos', jsonValue);
    } catch (e) {
      // FIXME: Handle exceptions
      // saving error
    }
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('todos');

      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      // FIXME: Handle exceptions
      // error reading value
    }
  };

  // On the first render, pull the stored todo items. We only need to do this on first render, because we are saving changes to the list as we go and they already show up in the list when the changes are made.
  useEffect(() => {
    getData().then(value => {
      console.log(value);
      setTodos(value);
    });
  }, []);

  // This will run any time an item is added or removed from the list
  useEffect(() => {
    console.log('UseEffect update');
    storeData(todos);
  }, [todos]);

  const sortTodos = oldTodos => {
    let temp = [...oldTodos];
    return temp.sort((itemA, itemB) => {
      return new Date(itemA.dueDate) - new Date(itemB.dueDate);
    });
  };

  // CREATE
  const addNewItem = () => {
    const uuid = uuidv4();
    setTodos(prevTodos => {
      let temp = [
        ...prevTodos,
        new TodoItem(
          uuid,
          title,
          new Date(dueDate).setTimeToAlmostMidnight(),
          interval,
        ),
      ];
      return sortTodos(temp);
    });

    setCreateModalOpen(false);
  };

  // DELETE
  const deleteItem = key => {
    setTodos(prevTodos => {
      return prevTodos.filter(todo => todo.key != key);
    });

    setEditModalOpen(false);
  };

  // UPDATE
  const startEdit = item => {
    console.log(`EDIT ${item.title}`);
    setSelectedItem(item.key);
    setTitle(item.title);
    setDueDate(item.dueDate);
    setInterval(item.interval);
    setEditModalOpen(true);
  };

  const saveEdit = key => {
    let item = todos.find(x => x.key === key);
    item.title = title;
    item.dueDate = new Date(dueDate).setTimeToAlmostMidnight();
    item.interval = Number(interval);

    // Since this function changes members of the object, it will not trigger the useEffect hook and we must manually store the updated object
    setTodos(sortTodos(todos));
    storeData(todos);
    setEditModalOpen(false);
  };

  const renewItem = item => {
    console.log(`RENEW ${item.title}`);
    item.dueDate = new Date().addDays(item.interval).setTimeToAlmostMidnight();

    // Since this function changes members of the object, it will not trigger the useEffect function and we must manually store the updated object
    setTodos(sortTodos(todos));
    storeData(todos);
  };

  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  Date.prototype.setTimeToAlmostMidnight = function () {
    var date = new Date(this.valueOf());
    date.setHours(23, 59, 59);
    return date;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.header}>Deja Do</Text>

      <Modal visible={editModalOpen} animationType="fade">
        <SafeAreaView style={{flex: 1}}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={styles.fieldTitle}>Name</Text>
            <TextInput
              style={styles.inputField}
              defaultValue={title}
              onChangeText={titleChangeHandler}
              returnKeyType="done"
            />
            <Text style={styles.fieldTitle}>Interval (days)</Text>
            <TextInput
              style={styles.inputField}
              defaultValue={`${interval}`}
              onChangeText={duartionChangeHandler}
              keyboardType="number-pad"
              returnKeyType="done"
            />
            <Text style={styles.fieldTitle}>Due Date</Text>
            <DatePicker
              date={new Date(dueDate)}
              onDateChange={dueDateChangeHandler}
              mode={'date'}
            />
            <View style={{marginTop: 20}}>
              <Button title="Save" onPress={() => saveEdit(selectedItem)} />
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
            <Text style={styles.fieldTitle}>Name</Text>
            <TextInput
              style={styles.inputField}
              placeholder="Title"
              onChangeText={titleChangeHandler}
              returnKeyType="done"
            />
            <Text style={styles.fieldTitle}>Interval (days)</Text>
            <TextInput
              style={styles.inputField}
              keyboardType="number-pad"
              placeholder="Interval"
              onChangeText={duartionChangeHandler}
              returnKeyType="done"
            />
            <Text style={styles.fieldTitle}>Due Date</Text>
            <DatePicker
              date={new Date(dueDate)}
              onDateChange={dueDateChangeHandler}
              mode={'date'}
            />
            <View style={{marginTop: 20}}>
              <Button title="Add" onPress={addNewItem} />
              <Button
                title="Cancel"
                onPress={() => {
                  setDueDate(new Date());
                  setCreateModalOpen(false);
                }}
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
            renewItem={renewItem}
            editItem={startEdit}
          />
        )}
        extraData={refresh}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <ActionButton
        buttonColor="rgba(0, 122, 255, 1)"
        onPress={() => {
          setDueDate(new Date());
          setCreateModalOpen(true);
        }}
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
  fieldTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default App;

class TodoItem {
  constructor(key, title, dueDate, interval) {
    this.key = key;
    this.title = title;
    this.interval = interval;
    this.dueDate = dueDate;
    this.daysRemaining = null;
  }
}
