import React, { useState } from "react";
import { FlatList, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import * as Progress from 'react-native-progress'
import TodoListItem from "./components/todoListItem";


const App = () => {
  const [todos, setTodos] = useState([
    new TodoItem("First Item", new Date(2022, 2, 15), 30),
    new TodoItem("Second Item", new Date(2022, 2, 25), 10),
    new TodoItem("Third Item", new Date(2022, 2, 30), 5),
    new TodoItem("Future Item", new Date(2022, 3, 3), 8),
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


class TodoItem{
  constructor(title, startDate, duration){
    this.title = title;
    this.duration = duration;
    this.startDate = startDate;
    this.dueDate = null;
  }

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

    this.dueDate = this.startDate.addDays(this.duration);

    // FIXME: If the start date is in the future, use Start Date - Duration as the initial start date so we can calculate what the "progress" should show

    var daysRemaining = daysBetween(Date.now(), this.dueDate);
    var progress = (this.duration - daysRemaining) / this.duration;
    
    return progress;
  }
}

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}