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

export default function TodoListItem({item}) {
  return (
    <Pressable style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
      <Progress.Bar
        progress={item.getProgress()}
        width={null}
        style={styles.progressBar}
      />
      <View style={styles.dateLine}>
        <Text style={styles.daysRemaining}>
          {item.daysRemaining} {daysRemainingMessage(item.daysRemaining)}
        </Text>
        <Text style={styles.dueDate}>{item.dueDate.toDateString()}</Text>
      </View>
    </Pressable>
  );
}

const daysRemainingMessage = function (numDays) {
  if (numDays === 1) return 'Day Remaining';
  else return 'Days Remaining';
};

const styles = StyleSheet.create({
  item: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    color: 'white',
  },
  title: {
    fontSize: 18,
    color: 'black',
  },
  progressBar: {
    marginTop: 5,
  },
  dateLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  dueDate: {
    // textAlign: "right",
    // marginTop: 3
  },
  daysRemaining: {
    // textAlign: "left",
    // marginTop: 3
  },
});
