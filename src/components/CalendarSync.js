import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CLIENT_ID = '152975720241-l24aqnbvq6temtr8e3u801p6k9ej0eth.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDw4W0PYVQFvs9UMHX7XzOXZDCCWS83yuA';

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

function TaskManagerApp() {
  const [taskName, setTaskName] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        setIsSignedIn(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(setIsSignedIn);
      });
    }
    gapi.load('client:auth2', start);
  }, []);

  const handleAuthClick = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleSyncClick = () => {
    if (!taskName) {
      alert('Please enter a task name.');
      return;
    }

    const event = {
      summary: taskName,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
    };

    gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    }).then((response) => {
      if (response.status === 200) {
        alert('Task synced to Google Calendar');
      } else {
        alert('Failed to sync task');
      }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Task Management App</h1>

      {!isSignedIn && (
        <button
          onClick={handleAuthClick}
          style={{ marginBottom: '10px', width: '100%' }}
        >
          Sign in with Google
        </button>
      )}

      {isSignedIn && (
        <div>
          <h2>Add a New Task</h2>
          <input
            type="text"
            placeholder="Enter task"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />

          <h2>Google Calendar Task Sync</h2>
          <div style={{ marginBottom: '10px' }}>
            <label>Task Name: {taskName}</label>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Start Time: </label>
            <DatePicker
              selected={startTime}
              onChange={(date) => setStartTime(date)}
              showTimeSelect
              dateFormat="Pp"
              className="form-control"
              placeholderText="Start time"
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>End Time: </label>
            <DatePicker
              selected={endTime}
              onChange={(date) => setEndTime(date)}
              showTimeSelect
              dateFormat="Pp"
              className="form-control"
              placeholderText="End time"
            />
          </div>
          <button
            onClick={handleSyncClick}
            style={{ width: '100%', backgroundColor: '#4CAF50', color: 'white', padding: '10px' }}
          >
            Sync Task to Google Calendar
          </button>
        </div>
      )}
    </div>
  );
}

export default TaskManagerApp;
