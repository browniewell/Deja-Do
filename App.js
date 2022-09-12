import React, {useRef, useEffect, useState} from 'react';
import {
  Alert,
  AppState,
  Button,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
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
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  getBadgeCount,
  setBadgeCount,
  getNotificationBadgeSetting,
} from 'react-native-notification-badge';

const App = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedItemKey, setSelectedItemKey] = useState('');
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [dueDate, setDueDate] = useState(new Date());
  const [interval, setInterval] = useState(1);
  const [intervalUnits, setIntervalUnits] = useState('days');

  const [isRecurring, setIsRecurring] = useState(true);
  const toggleRecurring = () => setIsRecurring(previousState => !previousState);

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

  // Dropdown stuff
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownItems, setDropdownItems] = useState([
    {label: 'Days', value: 'days'},
    {label: 'Weeks', value: 'weeks'},
    {label: 'Months', value: 'months'},
  ]);

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

  const intervalChangeHandler = val => {
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
      setBadge(todos);
    });
  }, []);

  // This will run any time an item is added or removed from the list
  useEffect(() => {
    console.log('UseEffect update');
    setBadge(todos);
    storeData(todos);
  }, [todos]);

  const sortTodos = oldTodos => {
    let temp = [...oldTodos];
    return temp.sort((itemA, itemB) => {
      return new Date(itemA.dueDate) - new Date(itemB.dueDate);
    });
  };

  const setBadge = todos => {
    var dueTodayOrOverdue = todos.filter(
      todo =>
        new Date(todo.dueDate) <= new Date(Date.now()).setTimeToMidnight(),
    );
    var badgeNum = dueTodayOrOverdue.length;
    setBadgeCount(badgeNum);
  };

  // CREATE
  const addNewItem = () => {
    const uuid = uuidv4();
    var adjustedDueDate = new Date(dueDate).setTimeToMidnight();
    setTodos(prevTodos => {
      let temp = [
        ...prevTodos,
        new TodoItem(
          uuid,
          title,
          adjustedDueDate,
          isRecurring
            ? interval
            : Math.ceil(
                daysBetween(
                  new Date(Date.now()).setTimeToMidnight(),
                  adjustedDueDate,
                ),
              ),
          isRecurring,

          // Default to days if the item is non-recurring
          isRecurring ? intervalUnits : 'days',
        ),
      ];
      return sortTodos(temp);
    });

    setCreateModalOpen(false);
  };

  // FIXME: Move this to a shared file, because it also exists in todoListItem.js
  function daysBetween(start, end) {
    function treatAsUTC(date) {
      var result = new Date(date);
      result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
      return result;
    }

    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    var daysBetween =
      (treatAsUTC(end) - treatAsUTC(start)) / millisecondsPerDay;
    return daysBetween;
  }

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
    setSelectedItemKey(item.key);
    setTitle(item.title);
    setDueDate(item.dueDate);
    setInterval(item.interval);
    setIsRecurring(item.isRecurring);
    setIntervalUnits(item.intervalUnits);
    setEditModalOpen(true);
  };

  const saveEdit = key => {
    let item = todos.find(x => x.key === key);
    item.title = title;
    item.dueDate = new Date(dueDate).setTimeToMidnight();
    var adjustedDueDate = new Date(dueDate).setTimeToMidnight();

    // The second part of this ternary operation sets a dummy interval for a non-recurring item, so that
    // the progress bar works properly
    item.interval = Number(
      isRecurring
        ? interval
        : Math.ceil(
            daysBetween(
              new Date(Date.now()).setTimeToMidnight(),
              adjustedDueDate,
            ),
          ),
    );
    item.isRecurring = isRecurring;

    // Default to days if the item is non-recurring
    item.intervalUnits = isRecurring ? intervalUnits : 'days';

    // Since this function changes members of the object, it will not trigger the useEffect hook and we must manually store the updated object
    setTodos(sortTodos(todos));
    storeData(todos);
    setBadge(todos);
    setEditModalOpen(false);
  };

  const renewItem = item => {
    if (!item.isRecurring) {
      console.log(`COMPLETE ${item.title}`);
      deleteItem(item.key);
    } else {
      console.log(`RENEW ${item.title}`);

      // Days - Add number of days to current date
      if (item.intervalUnits == 'days') {
        item.dueDate = new Date().addDays(item.interval).setTimeToMidnight();
      }

      // Weeks - Add number of weeks to current date
      else if (item.intervalUnits == 'weeks') {
        item.dueDate = new Date()
          .addDays(new Number(item.interval) * 7)
          .setTimeToMidnight();
      }

      // Months - Set due date to current day of next month
      else if ((item.intervalUnits = 'months')) {
        item.dueDate = addMonths(new Date(), item.interval).setTimeToMidnight();
      } else {
        // Make Days the default to handle legacy items
        console.log('LEGACY');
        item.dueDate = new Date().addDays(item.interval).setTimeToMidnight();
      }

      // Since this function changes members of the object, it will not trigger the useEffect function and we must manually store the updated object
      setTodos(sortTodos(todos));
      setBadge(todos);
      storeData(todos);
    }
  };

  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };

  function addMonths(date, months) {
    var d = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (date.getDate() != d) {
      date.setDate(0);
    }
    return date;
  }

  Date.prototype.setTimeToMidnight = function () {
    var date = new Date(this.valueOf());
    date.setHours(0, 0, 0);
    return date;
  };

  const confirmDelete = key => {
    let item = todos.find(x => x.key === key);
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete '${item.title}'?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteItem(selectedItemKey),
          style: 'destructive',
        },
      ],
    );
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
              onChangeText={titleChangeHandler}
              returnKeyType="done"
              value={title}
            />

            {isRecurring && (
              <View style={{alignItems: 'center'}}>
                <Text style={styles.fieldTitle}>Interval</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <TextInput
                    style={styles.inputField}
                    onChangeText={intervalChangeHandler}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    value={`${interval}`}
                    clearTextOnFocus={true}
                  />
                  <DropDownPicker
                    open={dropdownOpen}
                    value={intervalUnits}
                    items={dropdownItems}
                    setOpen={setDropdownOpen}
                    setValue={setIntervalUnits}
                    setItems={setDropdownItems}
                    containerStyle={{
                      width: 120,
                      marginVertical: 5,
                      marginHorizontal: 20,
                    }}
                  />
                </View>
              </View>
            )}
            <View
              style={{
                // flex: 1,
                // justifyContent: 'center',
                alignItems: 'center',
                zIndex: -1,
              }}>
              <Text style={styles.fieldTitle}>Due Date</Text>
              <DatePicker
                date={new Date(dueDate)}
                onDateChange={dueDateChangeHandler}
                mode={'date'}
              />
              <View style={{flexDirection: 'row'}}>
                <Text
                  style={{
                    marginTop: 5,
                    marginRight: 5,
                    fontSize: 16,
                    fontWeight: '500',
                  }}>
                  Recurring
                </Text>
                <Switch
                  value={isRecurring}
                  onValueChange={toggleRecurring}
                  style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
                />
              </View>
              <View style={{marginTop: 20}}>
                <Button
                  title="Save"
                  onPress={() => saveEdit(selectedItemKey)}
                />
                <Button
                  title="Cancel"
                  onPress={() => setEditModalOpen(false)}
                />
                <Button
                  title="Delete"
                  color="red"
                  onPress={() => confirmDelete(selectedItemKey)}
                />
              </View>
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
            {/* <View style={{flexDirection: 'row'}}>
              <Text
                style={{
                  marginTop: 5,
                  marginRight: 5,
                  fontSize: 16,
                  fontWeight: '500',
                }}>
                Recurring
              </Text>
              <Switch
                value={isRecurring}
                onValueChange={toggleRecurring}
                style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
              />
            </View> */}
            {isRecurring && (
              <View style={{alignItems: 'center'}}>
                <Text style={styles.fieldTitle}>Interval</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <TextInput
                    style={styles.inputField}
                    onChangeText={intervalChangeHandler}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    value={`${interval}`}
                    clearTextOnFocus={true}
                  />
                  <DropDownPicker
                    open={dropdownOpen}
                    value={intervalUnits}
                    items={dropdownItems}
                    setOpen={setDropdownOpen}
                    setValue={setIntervalUnits}
                    setItems={setDropdownItems}
                    containerStyle={{
                      width: 120,
                      marginVertical: 5,
                      marginHorizontal: 20,
                    }}
                  />
                </View>
              </View>
            )}
            <View
              style={{
                // flex: 1,
                // justifyContent: 'center',
                alignItems: 'center',
                zIndex: -1,
              }}>
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

      <ActionButton buttonColor="rgba(0, 122, 255, 1)">
        <ActionButton.Item
          buttonColor="rgba(0, 122, 255, 1)"
          title="New Recurring Task"
          onPress={() => {
            setDueDate(new Date());
            setIsRecurring(true);
            setInterval(1);
            setIntervalUnits('days');
            setCreateModalOpen(true);
          }}>
          <Icon name="refresh" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="rgba(0, 122, 255, 1)"
          title="New Task"
          onPress={() => {
            setDueDate(new Date());
            setIsRecurring(false);
            setIntervalUnits('days');
            setCreateModalOpen(true);
          }}>
          <Icon name="check" style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
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
    fontSize: 20,
    marginHorizontal: 20,
  },
  fieldTitle: {
    fontWeight: 'bold',
    fontSize: 24,
  },
});

export default App;

class TodoItem {
  constructor(key, title, dueDate, interval, isRecurring, intervalUnits) {
    this.key = key;
    this.title = title;
    this.interval = interval;
    this.dueDate = dueDate;
    this.daysRemaining = null;
    this.isRecurring = isRecurring;
    this.intervalUnits = intervalUnits;
  }
}
