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
        name={handleRecurringUndefined(item)}
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

const handleRecurringUndefined = function (item) {
  // Default to true in order to handle legacy items
  var recurring = item.isRecurring ?? true;
  return recurring ? 'refresh' : 'done';
};

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

  // FIXME: If the due date is farther out than the current date plus the interval, the progress bar will be empty until that is no longer the case. This is only applicable on the first occurrence.
  item.daysRemaining = daysBetween(Date.now(), item.dueDate);
  var progress;

  // This can happen if the new item is due on the same day it's created, since the due time is midnight on that day. In these cases, set progress bar to full and days remaining to 0.
  if (item.daysRemaining < 0) {
    progress = 1;
    item.daysRemaining = 0;
  } else {
    progress = (item.interval - item.daysRemaining) / item.interval;

    // Add 1 to days remaining to account for the midnight due date
    item.daysRemaining = Math.floor(item.daysRemaining) + 1;
  }

  return progress;
};

const getProgressBarColor = function (item) {
  // console.log(`Days Remaining: ${item.daysRemaining}`);
  if (item.daysRemaining <= 2 && item.daysRemaining > 0) {
    // Yellow
    return 'rgba(255, 204, 0, 1)';
  } else if (item.daysRemaining == 0) {
    // Green
    return 'rgba(76, 217, 100, 1)';
  } else if (item.daysRemaining < 0) {
    // Red
    return 'rgba(255, 59, 48, 1)';
  } else {
    // Blue
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
