import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

function TaskManagerApp() {
  const [taskName, setTaskName] = useState('');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state

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
        setLoading(false); // Stop loading once gapi is ready
      }).catch(err => {
        console.error('Error initializing Google API:', err);
        setLoading(false);
      });
    }

    gapi.load('client:auth2', start);
  }, []);

  const handleAuthClick = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance) {
      authInstance.signIn();
    } else {
      alert('Google API not loaded properly. Please try again.');
    }
  };

  const handleSyncClick = () => {
    if (!taskName) {
      alert('Please enter a task name.');
      return;
    }

    console.log('Start Time:', startTime.toISOString());
    console.log('End Time:', endTime.toISOString());

    if (endTime <= startTime) {
      alert('End time must be later than start time.');
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
        const newTask = {
          id: response.result.id,
          name: taskName,
        };
        setTasks([...tasks, newTask]);
        alert('Task synced to Google Calendar');
      } else {
        alert('Failed to sync task');
      }
    }).catch(err => {
      console.error('Error syncing task to calendar:', err);
      alert('Failed to sync task');
    });
  };

  const handleDelete = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);

    gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: taskId,
    }).then((response) => {
      if (response.status === 204) {
        alert('Task deleted from Google Calendar');
      } else {
        alert('Failed to delete task from Google Calendar');
      }
    }).catch(err => {
      console.error('Error deleting task from calendar:', err);
      alert('Failed to delete task');
    });
  };

  if (loading) {
    return <p>Loading Google API...</p>; // Show a loading message while waiting for gapi
  }

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

          {/* Task List */}
          <h2>Task List</h2>
          <ul>
            {tasks.map((task, index) => (
              <li key={task.id}>
                {task.name}
                <button onClick={() => handleDelete(task.id)} style={{ marginLeft: '10px', color: 'red' }}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TaskManagerApp;
