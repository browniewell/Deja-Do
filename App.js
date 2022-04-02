import React, {useState} from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import TodoListItem from './components/todoListItem';

const App = () => {
  const [todos, setTodos] = useState([
    new TodoItem('First Item', new Date(2022, 3, 15), 30),
    new TodoItem('Second Item', new Date(2022, 3, 5), 10),
    new TodoItem('Third Item', new Date(2022, 3, 9), 5),
    new TodoItem('Fourth Item', new Date(2022, 3, 2), 4),
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Recurrence</Text>
      <FlatList
        data={todos}
        renderItem={({item}) => <TodoListItem item={item} />}
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
});

export default App;

class TodoItem {
  constructor(title, dueDate, duration) {
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
