import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import * as Progress from 'react-native-progress'
import TodoListItem from "./components/todoListItem";


class TodoItem{
  // TODO: When we create a new item,
  // -- If no start date is specified, use create time as start
  // -- If start date and duration specified, infer due date as start date plus duration
  // -- If no duration is specified, use time between start date and due date as the duration
  // -- If if due date and duration specified, infer start date as the due date minus the duration
  // TODO: Add duration to constructor, but check the above conditions to handle undefined/null params
  constructor(title, dueDate, startDate){
    this.title = title;
    this.dueDate = dueDate;
    this.startDate = startDate;
  }

  // FIXME: We can get into a situation where the Due Date comes before the Start date, so add protection for that
  getProgress(){
    function treatAsUTC(date) {
      var result = new Date(date);
      result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
      return result;
    }

    function daysBetween(start, end){
      var millisecondsPerDay = 24 * 60 * 60 * 1000;
      var daysBetween = (treatAsUTC(end) - treatAsUTC(start)) / millisecondsPerDay;
      return daysBetween;
    }

    var duration = daysBetween(this.startDate, this.dueDate);
    var daysRemaining = daysBetween(Date.now(), this.dueDate);
    var progress = (duration - daysRemaining) / duration;
    
    return progress;
  }
}

const App = () => {
  const [todos, setTodos] = useState([
    new TodoItem("First Item", new Date(2022, 3, 15), new Date(2022, 2, 29)),
    new TodoItem("Second Item", new Date(2022, 3, 1), new Date(2022, 2, 27)),
    new TodoItem("Third Item", new Date(2022, 3, 2), new Date(2022, 2, 30))
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={ todos }
        renderItem={({ item }) => (
          <TodoListItem item={ item } />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
});

export default App;