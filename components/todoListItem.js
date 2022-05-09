import React, {useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function TodoListItem({item, renewItem, editItem}) {
  return (
    <View style={styles.item}>
      <MaterialIcon
        name="refresh"
        size={25}
        style={styles.refreshIcon}
        onPress={() => renewItem(item)}
      />
      <Pressable
        style={({pressed}) => [{opacity: pressed ? 0.5 : 1.0}, {flex: 1}]}
        onPress={() => {
          editItem(item);
        }}>
        <Text style={styles.title}>{item.title}</Text>
        <Progress.Bar
          progress={getProgress(item)}
          width={null}
          color={getProgressBarColor(item)}
          style={styles.progressBar}
        />
        <View style={styles.dateLine}>
          <Text style={styles.daysRemaining}>
            {daysRemainingMessage(item.daysRemaining)}
          </Text>
          <Text style={styles.dueDate}>
            {new Date(item.dueDate).toDateString()}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const getProgress = function (item) {
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
  item.daysRemaining = daysBetween(Date.now(), item.dueDate);
  var progress = (item.duration - item.daysRemaining) / item.duration;

  item.daysRemaining = Math.ceil(item.daysRemaining);

  return progress;
};

const getProgressBarColor = function (item) {
  let progress = getProgress(item);
  console.log(`Progress: ${progress}`);
  if (progress < 0.9 && progress >= 0.66) {
    return 'rgba(255, 204, 0, 1)';
  } else if (progress >= 1) {
    return 'rgba(255, 59, 48, 1)';
  } else {
    return 'rgba(0, 122, 255, 1)';
  }
};

const daysRemainingMessage = numDays => {
  let pluralString = Math.abs(numDays) === 1 ? 'Day' : 'Days';
  if (numDays < 0) {
    return `${Math.abs(numDays)} ${pluralString} Overdue`;
  } else {
    return `${numDays} ${pluralString} Remaining`;
  }
};

const styles = StyleSheet.create({
  item: {
    padding: 10,
    marginVertical: 5,
    marginRight: 15,
    marginLeft: 5,
    color: 'white',
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshIcon: {
    marginRight: 10,
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
