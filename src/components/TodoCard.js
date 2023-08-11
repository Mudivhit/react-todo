import axios from "axios";
import React, { useState } from "react";

export default function TodoCard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const authToken = localStorage.getItem("authToken");
  const [tasks, setTasks] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskData, setEditedTaskData] = useState({});
  const apiUrl = process.env.REACT_APP_API_URL;

  const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const startEditing = (taskId, currentData) => {
    setEditingTaskId(taskId);
    setEditedTaskData(currentData);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditedTaskData({});
  };

  const saveEditedTask = async (id) => {
    try {
      await axiosInstance.put(`/tasks/${id}`, editedTaskData);
      await fetchTasks();
      setEditingTaskId(null);
      setEditedTaskData({});
    } catch (error) {
      alert("Error editing task:", error);
    }
  };

  const handleAuth = async (action) => {
    try {
      const response = await axios.post(`${apiUrl}/${action}`, {
        username,
        password,
      });
      if (response.status === 200 && action === "login") {
        fetchTasks();
        setIsLoggedIn(true);
        const token = response.data.token;
        localStorage.setItem("authToken", token);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(`${action} failed: ${error}`);
    }
  };

  const editTask = async (id, newData) => {
    try {
      await axiosInstance.put(`${apiUrl}/tasks/${id}`, newData);
      fetchTasks();
    } catch (error) {
      alert("Error editing task:", error);
    }
  };

  const createTask = async (newTask) => {
    try {
      await axiosInstance.post(`${apiUrl}/tasks`, newTask);
      fetchTasks();
    } catch (error) {
      alert("Error creating task:", error);
    }
  };

  const fetchTasks = async () => {
    if (isLoggedIn) {
      try {
        const response = await axiosInstance.get(`${apiUrl}/tasks`);
        setTasks(response.data);
      } catch (error) {
        alert("Error fetching tasks:", error);
      }
    }
  };
  const deleteTask = async (id) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      alert("Error deleting task:", error);
    }
  };

  return (
    <div className='wrapper'>
      {isLoggedIn ? (
        <>
          <h2>Welcome</h2>
          <div>
            {/* Create task section */}
            <h2>Create New Task</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const title = e.target.title.value;
                const description = e.target.description.value;
                createTask({ title, description, completed: false });
                e.target.reset();
              }}>
              <label>
                Title:
                <input type='text' name='title' required />
              </label>
              <br />
              <label>
                Description:
                <input type='text' name='description' />
              </label>
              <br />
              <button type='submit'>Create Task</button>
            </form>
          </div>
          {/* Edit Tasks section */}
          <h2>Task List</h2>
          <div className='task-cards'>
            {tasks.map((task) => (
              <div key={task.id} className='task-card'>
                <h2>{task.title}</h2>
                {editingTaskId === task.id ? (
                  <>
                    <input
                      type='text'
                      value={editedTaskData.title || ""}
                      onChange={(e) =>
                        setEditedTaskData({
                          ...editedTaskData,
                          title: e.target.value,
                        })
                      }
                    />
                    <textarea
                      value={editedTaskData.description || ""}
                      onChange={(e) =>
                        setEditedTaskData({
                          ...editedTaskData,
                          description: e.target.value,
                        })
                      }
                    />
                    <button onClick={() => saveEditedTask(task.id)}>
                      Save
                    </button>
                    <button onClick={() => cancelEditing()}>Cancel</button>
                  </>
                ) : (
                  <>
                    <p>Description: {task.description}</p>
                    <p>Completed: {task.completed ? "Yes" : "No"}</p>
                    <button
                      onClick={() =>
                        editTask(task.id, {
                          ...task,
                          completed: !task.completed,
                        })
                      }>
                      Toggle Completed
                    </button>
                    <button onClick={() => startEditing(task.id, task)}>
                      Edit
                    </button>
                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        // Auth Section
        <div>
          <h2>Login / Signup </h2>
          <label>
            Username:
            <input
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <br />
          <label>
            Password:
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <br />
          <button onClick={() => handleAuth("login")}>Login</button>
          <button onClick={() => handleAuth("register")}>Signup</button>
        </div>
      )}
    </div>
  );
}
