import React from 'react';

function TaskList({ tasks, deleteTask }) {
  return (
    <div>
      <h3>Task List</h3>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            {task} <button onClick={() => deleteTask(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
